import { Logger } from '@nestjs/common';
import bcrypt from 'bcrypt';

export class BcryptUtil {
  private readonly saltRounds: number = 8;
  private readonly logger: Logger = new Logger(BcryptUtil.name);

  async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      this.logger.error('Failed to hash password', error);
      throw new Error('Failed to hash password');
    }
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      this.logger.error('Failed to compare password', error);
      throw new Error('Failed to compare password');
    }
  }

  async hashToken(token: string): Promise<string> {
    try {
      return await bcrypt.hash(token, this.saltRounds);
    } catch (error) {
      this.logger.error('Failed to hash token', error);
      throw new Error('Failed to hash token');
    }
  }

  async verifyToken(token: string, hashedToken: string): Promise<boolean> {
    try {
      return await bcrypt.compare(token, hashedToken);
    } catch (error) {
      this.logger.error('Failed to verify token', error);
      throw new Error('Failed to verify token');
    }
  }

  async hashAccessCode(accessCode: string): Promise<string> {
    try {
      return await bcrypt.hash(accessCode, 5);
    } catch (error) {
      this.logger.error('Failed to hash access code', error);
      throw new Error('Failed to hash access code');
    }
  }

  async verifyAccessCode(
    accessCode: string,
    hashedAccessCode: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(accessCode, hashedAccessCode);
    } catch (error) {
      this.logger.error('Failed to verify access code', error);
      throw new Error('Failed to verify access code');
    }
  }
}
