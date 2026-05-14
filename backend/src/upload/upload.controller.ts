import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { GetPresignedUrlDto } from './dto/upload.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Upload')
@ApiBearerAuth('JWT')
@Controller('upload')
export class UploadController {
  constructor(private readonly svc: UploadService) {}

  @Post('presigned-url')
  @ApiOperation({ summary: 'S3 Presigned Upload URL 발급 (mobile → S3 직접 업로드)' })
  getPresignedUrl(@CurrentUser() user: any, @Body() dto: GetPresignedUrlDto) {
    return this.svc.getPresignedUrl(user.id, dto);
  }
}
