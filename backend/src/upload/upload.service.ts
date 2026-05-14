import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { GetPresignedUrlDto } from './dto/upload.dto';

@Injectable()
export class UploadService {
  private readonly s3: AWS.S3;
  private readonly bucket: string;
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly config: ConfigService) {
    this.s3 = new AWS.S3({
      region:          config.get<string>('AWS_REGION', 'ap-northeast-2'),
      accessKeyId:     config.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: config.get<string>('AWS_SECRET_ACCESS_KEY'),
    });
    this.bucket = config.get<string>('AWS_S3_BUCKET', 'todaysfamily-images');
  }

  async getPresignedUrl(userId: string, dto: GetPresignedUrlDto) {
    const ext    = dto.fileName.split('.').pop() ?? 'jpg';
    const folder = dto.folder ?? `users/${userId}`;
    const key    = `${folder}/${uuidv4()}.${ext}`;

    try {
      const uploadUrl = await this.s3.getSignedUrlPromise('putObject', {
        Bucket:      this.bucket,
        Key:         key,
        ContentType: dto.contentType,
        Expires:     300, // 5 minutes
        ACL:         'private',
      });

      const imageUrl = `https://${this.bucket}.s3.${this.config.get('AWS_REGION', 'ap-northeast-2')}.amazonaws.com/${key}`;

      return { uploadUrl, imageUrl, key };
    } catch (err) {
      this.logger.error('Failed to generate presigned URL', err);
      throw new InternalServerErrorException('업로드 URL 생성에 실패했습니다.');
    }
  }

  async deleteObject(key: string) {
    try {
      await this.s3.deleteObject({ Bucket: this.bucket, Key: key }).promise();
    } catch (err) {
      this.logger.warn(`Failed to delete S3 object: ${key}`, err);
    }
  }
}
