import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'src/database/entities/user.entity';
import { UpdateUserBodyDto } from './dto/update.dto';
import Session from 'src/database/entities/session.entity';
import { Account } from 'src/database/entities/account.entity';
import { UserRepository } from 'src/database/repositories/user.repository';
import { ProviderEnum } from 'src/common/enums/provider.enum';
import { UserInfoDto } from 'src/auth/dto/user-info.dto';

import LoggerService from 'src/common/logger/logger.service';
import { AwsS3Util } from 'src/common/utils/aws-s3.util';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import Subscription from 'src/database/entities/subscription.entity';
import Plan from 'src/database/entities/plan.entity';
import { PlanEnum } from 'src/common/enums/plans.enum';
import { XenditService } from 'src/common/xendit/xendit.service';
import { Request } from 'express';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: LoggerService,
    private readonly awsS3Util: AwsS3Util,
    private readonly xenditService: XenditService,
  ) {}

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async validateUniqueUser(
    email?: string,
    username?: string,
    user?: User,
  ): Promise<void> {
    const existingUser =
      await this.userRepository.findByEmailOrUsernameOptional(email, username);
    if (existingUser) {
      if (user && (user.email == email || user.username == username)) {
        return;
      }
      const fieldExist = existingUser.email == email ? 'email' : 'username';
      throw new ConflictException(`${fieldExist} already exists`);
    }
  }

  async createUserAndAccountByGoogle(
    data: Partial<User>,
    providerId: string,
  ): Promise<any> {
    const { email: providerEmail, username: providerUsername } = data;

    return await this.userRepository.manager.transaction(async (manager) => {
      const user = manager.create(User, data);
      const { id: externalId } = await this.xenditService.createCustomer(user);
      user.externalId = externalId;
      await manager.save(user);

      const account = manager.create(Account, {
        user,
        providerAccountId: providerId,
        provider: ProviderEnum.GOOGLE,
        providerUsername,
        providerEmail,
        isVerified: true,
      });

      await manager.save(account);

      // Create session
      const session = manager.create(Session, {
        user,
        account,
      });
      await manager.save(session);

      // Create Subscription (Free Plan)
      const plan = await manager.findOneByOrFail(Plan, {
        name: PlanEnum.FREE,
      });

      const subscription = manager.create(Subscription, {
        user,
        plan,
      });
      subscription.initializeSubscriptionPeriod();
      await manager.save(subscription);

      await manager.update(User, user.id, {
        activeSubscription: subscription,
      });

      return { user, account, session };
    });
  }

  async createUserWithAccountAndSession(
    data: Partial<User>,
    passwordHash: string,
  ): Promise<{ user: User; account: Account; session: Session }> {
    return this.userRepository.manager.transaction(async (manager) => {
      const { email: providerEmail, username: providerUsername } = data;

      // Validate and create user
      await this.validateUniqueUser(providerEmail, providerUsername);

      const user = manager.create(User, data);
      const { id: externalId } = await this.xenditService.createCustomer(user);
      user.externalId = externalId;
      await manager.save(user);

      // Validate unique local account
      const existingAccount = await manager.findOneBy(Account, {
        providerEmail,
        providerUsername,
        provider: ProviderEnum.LOCAL,
      });
      if (existingAccount) {
        throw new ConflictException('Account already exists');
      }

      // Create account
      const account = manager.create(Account, {
        user,
        providerAccountId: user.id,
        provider: ProviderEnum.LOCAL,
        providerEmail,
        providerUsername,
        passwordHash,
      });
      await manager.save(account);

      // Create session
      const session = manager.create(Session, {
        user,
        account,
      });
      await manager.save(session);

      // Create Subscription (Free Plan)
      const plan = await manager.findOneByOrFail(Plan, {
        name: PlanEnum.FREE,
      });

      const subscription = manager.create(Subscription, {
        user,
        plan,
      });
      subscription.initializeSubscriptionPeriod();
      await manager.save(subscription);

      await manager.update(User, user.id, {
        activeSubscription: subscription,
      });

      return { user, account, session };
    });
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOneById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findUserByExternalId(externalId: string): Promise<User> {
    const user = await this.userRepository.findOneByExternalId(externalId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async requestEmailChange(user: User, email: string) {
    await Promise.resolve().then(() =>
      this.logger.debug(
        `Requesting email change for user ${user.id} to ${email}`,
      ),
    );
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const { username, email, ...updateUser } = data;
    const existingUser = await this.findUserById(id);

    if (username || email) {
      await this.validateUniqueUser(email, username, existingUser);
      if (email) await this.requestEmailChange(existingUser, email);
    }
    const user = await this.userRepository.updateOne(existingUser, updateUser);
    return user;
  }

  async updateUser(
    req: Request,
    body: UpdateUserBodyDto,
    id: string,
  ): Promise<UserInfoDto> {
    const { providers, lastLoginAt, avatar } = req.user;
    const { externalId, ...user } = await this.update(id, body);
    return {
      ...user,
      avatar,
      customerId: externalId,
      providers,
      lastLoginAt,
    };
  }

  async uploadImageAndGetUrl(
    file: Express.Multer.File,
    imageKey: string,
  ): Promise<string> {
    try {
      const key = await this.awsS3Util.uploadFile(file, imageKey);
      return await this.awsS3Util.getFileUrl(key);
    } catch (error) {
      if (error instanceof Error)
        throw new InternalServerErrorException(error.message);
      throw error;
    }
  }

  async imageUpload(
    req: Request,
    file: Express.Multer.File,
  ): Promise<UserInfoDto> {
    const { providers, lastLoginAt } = req.user;
    const imageKey = `users/${req.user.id}/avatars/${randomUUID()}${path.extname(file.originalname)}`;
    const avatar = await this.uploadImageAndGetUrl(file, imageKey);
    const { externalId, ...user } = await this.update(req.user.id, {
      avatar: imageKey,
    });

    return {
      ...user,
      customerId: externalId,
      avatar,
      providers,
      lastLoginAt,
    };
  }
}
