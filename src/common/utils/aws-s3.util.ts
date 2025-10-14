import {
  GetObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/config/env.config';
import LoggerService from 'src/common/logger/logger.service';
import { extname } from 'path';
import * as mime from 'mime-types';

@Injectable()
export class AwsS3Util {
  private s3Client: S3Client;
  private bucket: string;
  constructor(
    private readonly config: ConfigService<Env>,
    private readonly logger: LoggerService,
  ) {
    this.bucket = this.config.getOrThrow('AWS_S3_BUCKET');
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: this.config.getOrThrow('AWS_ACCESS_KEY'),
        secretAccessKey: this.config.getOrThrow('AWS_SECRET_KEY'),
      },
      region: this.config.getOrThrow('AWS_S3_REGION'),
    });
  }

  async getFileUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const ext = extname(key);
      const type = mime.lookup(ext) || 'application/octet-stream';

      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ResponseContentType: type,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      this.logger.error('Failed to get file URL from AWS S3', error);
      throw new Error('Failed to get file URL from AWS S3');
    }
  }

  async uploadFile(file: Express.Multer.File, key: string) {
    try {
      const params: PutObjectCommandInput = {
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      await this.s3Client.send(new PutObjectCommand(params));
      return key;
    } catch (error) {
      this.logger.error('Failed to upload file to AWS S3', error);
      throw new Error('Failed to upload file to AWS S3');
    }
  }
}
