import { Injectable, NotFoundException } from '@nestjs/common';
import { BillingAddressRepository } from 'src/database/repositories/billing-address.repository';
import { BillingAddressDto } from './dto/billing-address.dto';
import { BillingAddress } from 'src/database/entities/billing-address.entity';
import { CreateBillingAddressBodyDto } from './dto/create.dto';
import { User } from 'src/database/entities/user.entity';
import { UpdateBillingAddressBodyDto } from './dto/update.dto';

@Injectable()
export class BillingAddressService {
  constructor(
    private readonly billingAddressRepository: BillingAddressRepository,
  ) {}

  private mapToDto(billingAddress: BillingAddress): BillingAddressDto {
    const { user, street1, street2, zipCode, ...rest } = billingAddress;
    return {
      ...rest,
      userId: user.id,
      address: street1,
      address2: street2,
      zip: zipCode,
    };
  }

  private async findOneByUserAndId(
    userId: string,
    id: string,
  ): Promise<BillingAddress> {
    const billingAddress = await this.billingAddressRepository.findByUserAndId(
      userId,
      id,
    );
    if (!billingAddress)
      throw new NotFoundException('Billing address not found');

    return billingAddress;
  }

  async getById(userId: string, id: string): Promise<BillingAddressDto> {
    const billingAddress = await this.findOneByUserAndId(userId, id);
    return this.mapToDto(billingAddress);
  }

  async getAll(userId: string): Promise<BillingAddressDto[]> {
    return (await this.billingAddressRepository.findAllByUser(userId)).map(
      (i) => this.mapToDto(i),
    );
  }

  async create(
    userId: string,
    data: CreateBillingAddressBodyDto,
  ): Promise<BillingAddressDto> {
    const user = await this.getUser(userId);
    const {
      address: street1,
      address2: street2,
      zip: zipCode,
      isDefault,
      ...rest
    } = data;
    const billingAddress =
      await this.billingAddressRepository.manager.transaction(
        async (manager) => {
          if (isDefault) {
            await manager.update(
              BillingAddress,
              { user: { id: user.id } },
              { isDefault: false },
            );
          }
          const billingAddress = manager.create(BillingAddress, {
            user,
            street1,
            street2,
            zipCode,
            isDefault,
            ...rest,
          });

          return await manager.save(billingAddress);
        },
      );

    return this.mapToDto(billingAddress);
  }

  async update(
    userId: string,
    id: string,
    data: UpdateBillingAddressBodyDto,
  ): Promise<BillingAddressDto> {
    const {
      address: street1,
      address2: street2,
      zip: zipCode,
      isDefault,
      ...rest
    } = data;
    const existing = await this.findOneByUserAndId(userId, id);
    const updatedAddress =
      await this.billingAddressRepository.manager.transaction(
        async (manager) => {
          if (isDefault) {
            await manager.update(
              BillingAddress,
              { user: { id: existing.user.id } },
              { isDefault: false },
            );
          }

          const merged = manager.merge(BillingAddress, existing, {
            street1,
            street2,
            zipCode,
            isDefault,
            ...rest,
          });
          return await manager.save(merged);
        },
      );
    return this.mapToDto(updatedAddress);
  }

  private async getUser(userId: string): Promise<User> {
    const userRepo = this.billingAddressRepository.manager.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
