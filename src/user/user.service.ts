import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'src/database/entities/user.entity';
import { UpdateUserDto, UserDto } from './dto/user.dto';
import Session from 'src/database/entities/session.entity';
import { Account } from 'src/database/entities/account.entity';
import { EntityManager } from 'typeorm';
import { UserRepository } from 'src/database/repositories/user.repository';
import { ProviderEnum } from 'src/common/enums/provider.enum';
import { providerSchema, UserInfoDto } from 'src/auth/dto/user-info.dto';
import { Request } from 'express';
import LoggerService from 'src/common/logger/logger.service';
import { ZodSerializerDto } from 'nestjs-zod';
import { AwsS3Util } from 'src/common/utils/aws-s3.util';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import Subscription from 'src/database/entities/subscription.entity';
import Plan from 'src/database/entities/plan.entity';
import { PlansEnum } from 'src/common/enums/plans.enum';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: LoggerService,
    private readonly awsS3Util: AwsS3Util,
  ) {}

  @ZodSerializerDto(UserInfoDto)
  async mapToUserInfoDto(account: Account, user: User): Promise<UserInfoDto> {
    const providers = providerSchema.parse(account);
    const { avatar, ...restUser } = user;
    const avatarUrl = avatar ? await this.awsS3Util.getFileUrl(avatar) : null;
    return {
      ...restUser,
      avatar: avatarUrl,
      providers,
      lastLoginAt: account.lastLoginAt,
    };
  }

  async validateUniqueUser(
    email?: string,
    username?: string,
  ): Promise<string | null> {
    const existingUser =
      await this.userRepository.findByEmailOrUsernameOptional(email, username);
    if (existingUser) {
      const fieldExist = existingUser.email == email ? 'email' : 'username';
      return `${fieldExist} already exists`;
    }
    return null;
  }

  async createUniqueUser(manager: EntityManager, userDto: UserDto) {
    const { email, username } = userDto;

    const existingUser = await manager.findOne(User, {
      where: [{ email }, { username }],
    });

    if (existingUser)
      throw new ConflictException(
        `${existingUser.email == email ? 'Email' : 'Username'} already exists`,
      );

    const user = manager.create(User, userDto);
    return await manager.save(user);
  }

  private async validateUniqueAccount(
    providerEmail: string,
    providerUsername: string,
    provider: ProviderEnum,
    manager: EntityManager,
  ) {
    const account = await manager.findOne(Account, {
      where: {
        providerEmail,
        providerUsername,
        provider,
      },
    });

    if (account) throw new ConflictException('Account already exists');
  }

  private async createUniqueLocalAccount(
    manager: EntityManager,
    user: User,
    passwordHash: string,
  ): Promise<Account> {
    await this.validateUniqueAccount(
      user.email,
      user.username,
      ProviderEnum.LOCAL,
      manager,
    );

    const account = manager.create(Account, {
      user,
      providerAccountId: user.id,
      provider: ProviderEnum.LOCAL,
      providerEmail: user.email,
      providerUsername: user.username,
      passwordHash,
    });

    return await manager.save(account);
  }

  async createUserWithAccountAndSession(
    userDto: UserDto,
    passwordHash: string,
  ): Promise<{ user: User; account: Account; session: Session }> {
    return this.userRepository.manager.transaction(async (manager) => {
      // Create user
      const user = await this.createUniqueUser(manager, userDto);

      // Create account
      const account = await this.createUniqueLocalAccount(
        manager,
        user,
        passwordHash,
      );

      // Create session
      const session = manager.create(Session, {
        user,
        account,
      });
      await manager.save(session);

      // Create Subscription (Free Plan)
      const plan = await manager.findOne(Plan, {
        where: {
          name: PlansEnum.FREE,
        },
      });

      if (!plan) throw new NotFoundException('Free plan not found');
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

  async findUserByExternalId(id: string): Promise<User> {
    const user = await this.userRepository.findOneById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateEmailOrUsername(username?: string, email?: string) {
    if (username)
      await Promise.resolve().then(() =>
        this.logger.debug('Send Email Change Username'),
      );
    if (email)
      await Promise.resolve().then(() =>
        this.logger.debug('Send Email Change Email'),
      );
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const { username, email, ...updateUser } = updateUserDto;
    const existingUser = await this.findUserById(id);

    if (username || email) {
      const conflictMessage = await this.validateUniqueUser(email, username);
      if (conflictMessage) throw new ConflictException(conflictMessage);
      await this.updateEmailOrUsername(username, email);
    }
    return await this.userRepository.updateOne(existingUser, updateUser);
  }

  async updateUser(
    req: Request,
    updateUserDto: UpdateUserDto,
    id: string,
  ): Promise<UserInfoDto> {
    const { providers, lastLoginAt } = req.user;
    const user = await this.update(id, updateUserDto);
    return {
      ...user,
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
    const user = await this.update(req.user.id, {
      avatar: imageKey,
    });
    user.avatar = avatar;
    return {
      ...user,
      avatar,
      providers,
      lastLoginAt,
    };
  }
}
