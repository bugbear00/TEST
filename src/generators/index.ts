/**
 * 콘텐츠 생성기 모듈
 */

export { BaseContentGenerator } from './base-generator';
export { KoreanContentGenerator } from './korean-generator';
export { MathContentGenerator } from './math-generator';
export { DigitalLiteracyContentGenerator } from './digital-literacy-generator';

import { KoreanContentGenerator } from './korean-generator';
import { MathContentGenerator } from './math-generator';
import { DigitalLiteracyContentGenerator } from './digital-literacy-generator';
import { Subject, ContentGenerationRequest, ContentGenerationResponse } from '../types';

/**
 * 콘텐츠 생성기 팩토리
 * 교과에 따라 적절한 생성기 반환
 */
export class ContentGeneratorFactory {
  private static koreanGenerator = new KoreanContentGenerator();
  private static mathGenerator = new MathContentGenerator();
  private static digitalLiteracyGenerator = new DigitalLiteracyContentGenerator();

  /**
   * 교과에 맞는 생성기로 콘텐츠 생성
   */
  static async generateContent(
    request: ContentGenerationRequest
  ): Promise<ContentGenerationResponse> {
    switch (request.subject) {
      case 'korean':
        return this.koreanGenerator.generate(request);
      case 'math':
        return this.mathGenerator.generate(request);
      case 'digital_literacy':
        return this.digitalLiteracyGenerator.generate(request);
      case 'integrated_subject':
        // 통합교과는 주제에 따라 국어 또는 수학 생성기 사용
        return this.koreanGenerator.generate(request);
      default:
        return {
          success: false,
          error: `지원하지 않는 교과입니다: ${request.subject}`
        };
    }
  }

  /**
   * 특정 교과 생성기 가져오기
   */
  static getGenerator(subject: Subject) {
    switch (subject) {
      case 'korean':
        return this.koreanGenerator;
      case 'math':
        return this.mathGenerator;
      case 'digital_literacy':
        return this.digitalLiteracyGenerator;
      default:
        return this.koreanGenerator;
    }
  }
}
