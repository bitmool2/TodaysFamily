import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { GenerateCaptionDto } from './dto/ai.dto';

@ApiTags('AI')
@ApiBearerAuth('JWT')
@Controller('ai')
export class AiController {
  constructor(private readonly svc: AiService) {}

  @Post('caption')
  @ApiOperation({ summary: 'AI 캡션 자동 생성 (GPT-4o Vision)' })
  generateCaption(@Body() dto: GenerateCaptionDto) {
    return this.svc.generateCaption(dto);
  }
}
