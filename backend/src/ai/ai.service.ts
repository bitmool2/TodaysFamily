import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GenerateCaptionDto } from './dto/ai.dto';

const FALLBACK_CAPTIONS = [
  '오늘 어린이집에서 즐거운 시간을 보냈어요 ❤️',
  '신나는 하루였어요! 사진을 보니 너무 행복해요 😊',
  '아이의 밝은 웃음이 온 가족을 행복하게 해요 🌟',
  '소중한 순간을 가족과 함께 나눠요 📸',
  '오늘도 건강하게 잘 놀았어요 🌈',
];

@Injectable()
export class AiService {
  private openai: OpenAI | null = null;
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly config: ConfigService) {
    const apiKey = config.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    } else {
      this.logger.warn('OPENAI_API_KEY not set — using fallback captions');
    }
  }

  async generateCaption(dto: GenerateCaptionDto): Promise<{ caption: string; isAi: boolean }> {
    if (!this.openai) {
      return { caption: this.randomFallback(), isAi: false };
    }

    try {
      const childPhrase = dto.childName ? `아이 이름은 ${dto.childName}입니다.` : '';

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 150,
        messages: [
          {
            role: 'system',
            content:
              '당신은 한국 가족 사진 앱의 AI 캡션 생성기입니다. ' +
              '어린이집/유치원 아이 사진을 보고 할머니 할아버지가 읽기 쉽게 ' +
              '따뜻하고 짧은 한국어 캡션을 이모지와 함께 작성해주세요. 2문장 이내.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `이 아이 사진에 어울리는 캡션을 작성해주세요. ${childPhrase}`,
              },
              {
                type: 'image_url',
                image_url: { url: dto.imageUrl, detail: 'low' },
              },
            ],
          },
        ],
      });

      const caption = response.choices[0]?.message?.content?.trim() ?? this.randomFallback();
      return { caption, isAi: true };
    } catch (err) {
      this.logger.error('OpenAI caption generation failed', err);
      return { caption: this.randomFallback(), isAi: false };
    }
  }

  private randomFallback(): string {
    return FALLBACK_CAPTIONS[Math.floor(Math.random() * FALLBACK_CAPTIONS.length)];
  }
}
