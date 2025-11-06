import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OkDto } from 'src/common/dto/response.dto';
import { PaymentMethodType } from 'src/common/enums/payment-method-type.enum';
import {
  PaymentMethodCallback,
  PaymentMethodData,
} from 'src/common/interfaces/xendit.interface';
import { PaymentMethod } from 'src/database/entities/payment-method.entity';
import { PaymentMethodRepository } from 'src/database/repositories/payment-method.repository';
import { UserService } from 'src/user/user.service';
import { PaymentMethodDto } from './dto/payment-method.dto';
import { PaymentMethodsMapper } from './mapper/payment-methods.mapper';
import { SortPaymentMethodsDto } from './dto/sort-payment-methods.dto';
import { XenditService } from 'src/common/xendit/xendit.service';
import { UrlGeneratorService } from 'nestjs-url-generator';
import LoggerService from 'src/common/logger/logger.service';
import {
  PaymentMethodActionDto,
  requestPaymentMethodParamsSchema,
} from './dto/request-payment-method.dto';
import { ValidatePaymentMethodDto } from './dto/validate-payment-method.dto';
import { TokenUtil } from 'src/common/utils/token.util';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { ZodValidationException } from 'nestjs-zod';
import { User } from 'src/database/entities/user.entity';

@Injectable()
export class PaymentMethodsService {
  constructor(
    private readonly paymentMethodRepository: PaymentMethodRepository,
    private readonly userService: UserService,
    private readonly paymentMethodMapper: PaymentMethodsMapper,
    private readonly xenditService: XenditService,
    private readonly urlGenService: UrlGeneratorService,
    private readonly logger: LoggerService,
    private readonly tokenUtil: TokenUtil,
  ) {}

  async createOrUpdatePaymentMethod(
    userExternalId: string,
    externalId: string,
    data: PaymentMethodData,
  ): Promise<PaymentMethod> {
    return this.paymentMethodRepository.manager.transaction(async (manager) => {
      const {
        reusability,
        status,
        failure_code: failureCode,
        type,
        country,
        metadata,
      } = data;

      const existingPaymentMethod = await manager.findOneBy(PaymentMethod, {
        externalId,
      });

      if (!existingPaymentMethod) {
        const user =
          await this.userService.findUserByExternalId(userExternalId);
        const allPaymentMethods =
          await this.paymentMethodRepository.findOneByUserId(user.id);

        // if new payment method is default and payment methods >= 1, update each rank (+1)
        const isDefault = metadata?.default || false;
        let rank = 1;

        if (isDefault && allPaymentMethods.length >= 1) {
          await this.paymentMethodRepository
            .createQueryBuilder()
            .update(PaymentMethod)
            .set({ rank: () => '"rank" + 1' })
            .where('userId = :userId', { userId: user.id })
            .execute();
        } else {
          rank = allPaymentMethods.length + 1;
        }

        const paymentMethod = manager.create(PaymentMethod, {
          externalId,
          user,
          customerId: userExternalId,
          type,
          reusability,
          status,
          rank,
          isDefault,
          country,
        });
        paymentMethod.assignPaymentMethodByType(type, data);
        const accountIdentityHash = paymentMethod.getAccountIdentityHash();
        const existingIdentity =
          await this.paymentMethodRepository.findOneByAccountIdentityHash(
            accountIdentityHash,
          );
        if (existingIdentity) {
          throw new ConflictException('Payment method already exists');
        }

        return await manager.save(paymentMethod);
      }

      const paymentMethod = manager.merge(
        PaymentMethod,
        existingPaymentMethod,
        {
          externalId,
          type,
          customerId: userExternalId,
          reusability,
          status,
          failureCode,
        },
      );
      paymentMethod.assignPaymentMethodByType(type, data);

      return await manager.save(paymentMethod);
    });
  }

  async handlePaymentMethodCallback(
    body: PaymentMethodCallback,
  ): Promise<OkDto> {
    const { data } = body;
    if (!data) throw new BadRequestException('Invalid payment method data');

    const { customer_id: userExternalId, id: externalId } = data;

    if (
      ![
        PaymentMethodType.CARD,
        PaymentMethodType.EWALLET,
        PaymentMethodType.DIRECT_DEBIT,
      ].includes(data.type)
    ) {
      throw new BadRequestException('Invalid payment method type');
    }
    await this.createOrUpdatePaymentMethod(userExternalId, externalId, data);
    return {
      message: 'OK',
    };
  }

  async findActiveRecurringByUser(userId: string): Promise<PaymentMethod[]> {
    return this.paymentMethodRepository.findManyRecurringByUser(userId);
  }

  async getAllPaymentMethods(userId: string): Promise<PaymentMethodDto[]> {
    const paymentMethods =
      await this.paymentMethodRepository.findManyByUser(userId);
    return paymentMethods.map((paymentMethod) =>
      this.paymentMethodMapper.mapToDto(paymentMethod),
    );
  }

  async getOneByUserAndId(userId: string, id: string): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodRepository.findOneByUserAndId(
      userId,
      id,
    );
    if (!paymentMethod) throw new NotFoundException('Payment method not found');
    return paymentMethod;
  }

  async getPaymentMethodById(
    userId: string,
    id: string,
  ): Promise<PaymentMethodDto> {
    const paymentMethod = await this.getOneByUserAndId(userId, id);
    return this.paymentMethodMapper.mapToDto(paymentMethod);
  }

  async sortPaymentMethods(
    userId: string,
    body: SortPaymentMethodsDto,
  ): Promise<PaymentMethodDto[]> {
    return this.paymentMethodRepository.manager.transaction(async (manager) => {
      return await Promise.all(
        body.map(async ({ paymentMethodId, rank }) => {
          const paymentMethod = await this.getOneByUserAndId(
            userId,
            paymentMethodId,
          );
          paymentMethod.rank = rank;
          paymentMethod.isDefault = rank === 1;

          await manager.save(paymentMethod);
          return this.paymentMethodMapper.mapToDto(paymentMethod);
        }),
      );
    });
  }

  async requestPaymentMethod(
    userId: string,
    successReturnUrl: string,
    failureReturnUrl: string,
  ): Promise<PaymentMethodActionDto[]> {
    const { id, email } = await this.userService.findUserById(userId);

    const signUrlAction = (
      relativePath: string,
      action: 'ADD_PAYMENT_METHOD' | 'VALIDATE_PAYMENT_METHOD',
      method: 'GET' | 'POST',
    ): PaymentMethodActionDto => {
      const token = this.tokenUtil.create(id, email, 99);

      let query: Record<string, string> = {
        token,
      };

      if (action === 'ADD_PAYMENT_METHOD') {
        const { error } = requestPaymentMethodParamsSchema.safeParse({
          successReturnUrl,
          failureReturnUrl,
        });
        if (error) throw new ZodValidationException(error);

        query = {
          ...query,
          successReturnUrl,
          failureReturnUrl,
        };
      }

      const url = this.urlGenService.signUrl({
        relativePath,
        query,
      });
      return {
        action,
        url,
        method,
      };
    };

    return [
      signUrlAction('public/payment-methods/add', 'ADD_PAYMENT_METHOD', 'GET'),
      signUrlAction(
        'public/payment-methods/validate',
        'VALIDATE_PAYMENT_METHOD',
        'POST',
      ),
    ];
  }

  async validatePaymentMethodWithToken(
    body: ValidatePaymentMethodDto,
    token: string,
  ): Promise<OkDto> {
    const userId = this.tokenUtil.verify(token)?.sub;
    if (!userId) throw new ForbiddenException('Invalid token');
    const user = await this.userService.findUserById(userId).catch(() => {
      throw new ForbiddenException('Unknown Resource');
    });
    await this.validatePaymentMethod(body, user);
    return { message: 'OK' };
  }

  async validatePaymentMethod(
    body: ValidatePaymentMethodDto,
    user: User,
  ): Promise<void> {
    const { card, directDebit, ewallet, type } = body;

    const requestPaymentMethod = this.paymentMethodRepository.create({
      user,
      type: type as PaymentMethodType,
      ...card,
      channelCode: directDebit?.channelCode || ewallet?.channelCode,
    });
    const accountIdentityHash = requestPaymentMethod.getAccountIdentityHash();

    const existingIdentity =
      await this.paymentMethodRepository.findOneByAccountIdentityHash(
        accountIdentityHash,
      );
    if (existingIdentity) {
      throw new ConflictException('Payment method already exists');
    }
  }

  async getAllPaymentMethodsOptions(token: string) {
    const userId = this.tokenUtil.verify(token)?.sub;
    if (!userId) throw new ForbiddenException('Invalid token');

    const user = await this.userService.findUserById(userId).catch(() => {
      throw new ForbiddenException('Unknown Resource');
    });
    const allowedPaymentMethods = [
      PaymentMethodType.DIRECT_DEBIT,
      PaymentMethodType.EWALLET,
      PaymentMethodType.CARD,
    ];

    const paymentMethodOptions = allowedPaymentMethods.map(async (type) => {
      let channelOptions: { channelCode: string; isAllowed: boolean }[] = [];
      const ewalletChannel = ['DANA', 'SHOPEEPAY'];
      const directDebitChannel = ['MANDIRI', 'BPI'];

      const getChannelOption = async (channelCode: string) => {
        const paymentMethod = this.paymentMethodRepository.create({
          user,
          type,
          channelCode,
        });
        const accountIdentityHash = paymentMethod.getAccountIdentityHash();
        const isAllowed = await this.paymentMethodRepository
          .findOneByAccountIdentityHash(accountIdentityHash)
          .then((existingPaymentMethod) => {
            return existingPaymentMethod ? false : true;
          });

        return {
          channelCode,
          isAllowed,
        };
      };

      const getEwalletOptions = async () => {
        return await Promise.all(
          ewalletChannel.map(async (channelCode) => {
            return await getChannelOption(channelCode);
          }),
        );
      };

      const getDirectDebitOptions = async () => {
        return await Promise.all(
          directDebitChannel.map(async (channelCode) => {
            return await getChannelOption(channelCode);
          }),
        );
      };

      switch (type) {
        case PaymentMethodType.EWALLET:
          channelOptions = await getEwalletOptions();
          break;
        case PaymentMethodType.DIRECT_DEBIT:
          channelOptions = await getDirectDebitOptions();
          break;
        case PaymentMethodType.CARD:
          channelOptions = [];
          break;
      }
      return {
        type,
        options: channelOptions,
      };
    });
    return {
      customerId: user.externalId,
      paymentMethodOptions: await Promise.all(paymentMethodOptions),
    };
  }

  async createPaymentMethodWithToken(
    token: string,
    body: CreatePaymentMethodDto,
  ): Promise<PaymentMethodActionDto> {
    const userId = this.tokenUtil.verify(token)?.sub;
    if (!userId) throw new ForbiddenException('Invalid Resource');
    return await this.createPaymentMethod(userId, body);
  }

  async createPaymentMethod(
    userId: string,
    body: CreatePaymentMethodDto,
  ): Promise<PaymentMethodActionDto> {
    const user = await this.userService.findUserById(userId);
    const { type, ewallet, directDebit, successReturnUrl, failureReturnUrl } =
      body;
    const ewalletParams = ewallet
      ? {
          channelCode: ewallet.channelCode,
          channelProperties: {
            successReturnUrl,
            failureReturnUrl,
          },
        }
      : undefined;

    const directDebitParams = directDebit
      ? {
          channelCode: directDebit.channelCode,
          channelProperties: {
            successReturnUrl,
            failureReturnUrl,
          },
        }
      : undefined;

    await this.validatePaymentMethod(
      {
        type,
        directDebit: directDebitParams,
        ewallet: ewalletParams,
      },
      user,
    );

    const { actions } = await this.xenditService.createPaymentMethod({
      type,
      reusability: 'MULTIPLE_USE',
      customerId: user.externalId,
      ewallet: ewalletParams,
      directDebit: directDebitParams,
    });

    if (!actions) {
      throw new BadRequestException('Failed to create payment method');
    }
    const { method, url } = actions[0];
    const channelCode =
      ewallet?.channelCode || directDebit?.channelCode || 'CHANNEL';
    return {
      action: `AUTH_${type}_${channelCode.toUpperCase()}`,
      url: url!,
      method: method! as PaymentMethodActionDto['method'],
    };
  }
}
