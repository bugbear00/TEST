/**
 * 콘텐츠 생성기 기본 클래스
 * 모든 교과별 생성기의 베이스
 */

import {
  Subject,
  ContentType,
  LearningContent,
  ContentGenerationRequest,
  ContentGenerationResponse,
  ContentElement,
  InteractionElement,
  ContentBody,
  ContentMetadata,
  GradeLevel,
  BloomTaxonomy,
  BloomLevel,
  ARCSMotivation,
  AchievementStandardReference,
  UDLAccessibility,
  Grade1DefaultUDLSettings,
  Grade1FeedbackMessages
} from '../types';

/**
 * 콘텐츠 생성기 추상 베이스 클래스
 */
export abstract class BaseContentGenerator {
  /** 교과 */
  protected abstract subject: Subject;

  /** 콘텐츠 버전 */
  protected version = '1.0.0';

  /**
   * 콘텐츠 생성
   */
  abstract generate(request: ContentGenerationRequest): Promise<ContentGenerationResponse>;

  /**
   * UUID 생성
   */
  protected generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * 기본 학년 정보 생성
   */
  protected createGradeLevel(semester: 1 | 2 = 1, unit?: string, week?: number): GradeLevel {
    return {
      grade: 1,
      semester,
      unit,
      week
    };
  }

  /**
   * 기본 메타데이터 생성
   */
  protected createMetadata(tags?: string[]): ContentMetadata {
    const now = new Date().toISOString();
    return {
      createdAt: now,
      updatedAt: now,
      version: this.version,
      author: 'AI-Edu Content Generator',
      reviewStatus: 'draft',
      tags: tags || []
    };
  }

  /**
   * 기본 Bloom 분류학 생성
   */
  protected createBloomTaxonomy(
    primaryLevel: BloomLevel = 'understand',
    secondaryLevel?: BloomLevel
  ): BloomTaxonomy {
    return {
      primaryLevel,
      secondaryLevel,
      cognitiveVerbs: this.getBloomVerbs(primaryLevel)
    };
  }

  /**
   * Bloom 수준별 인지 동사 가져오기
   */
  protected getBloomVerbs(level: BloomLevel): string[] {
    const verbs: Record<BloomLevel, string[]> = {
      remember: ['말하다', '찾다', '가리키다', '따라 하다'],
      understand: ['설명하다', '비교하다', '구별하다', '표현하다'],
      apply: ['사용하다', '적용하다', '해결하다', '만들다'],
      analyze: ['비교하다', '구분하다', '연결하다', '분류하다'],
      evaluate: ['판단하다', '선택하다', '평가하다', '점검하다'],
      create: ['만들다', '설계하다', '구성하다', '창작하다']
    };
    return verbs[level];
  }

  /**
   * 기본 ARCS 동기 요소 생성
   */
  protected createARCSMotivation(theme?: string): ARCSMotivation {
    return {
      attention: {
        strategyType: 'perceptual_arousal',
        strategy: '친근한 캐릭터와 밝은 색상으로 흥미 유발',
        elements: [
          {
            type: 'character',
            description: '안내 캐릭터의 친근한 인사와 격려'
          },
          {
            type: 'animation',
            description: '학습 요소 등장 애니메이션'
          },
          {
            type: 'sound',
            description: '효과음과 배경 음악'
          }
        ]
      },
      relevance: {
        strategyType: 'familiarity',
        strategy: '일상생활 경험과 연결',
        realWorldConnection: theme || '학교와 가정에서의 일상 경험',
        studentInterestConnection: '또래 친구들과의 활동'
      },
      confidence: {
        strategyType: 'success_opportunities',
        scaffolding: [
          { step: 1, support: '모범 예시 보여주기', fadeCondition: '첫 정답 후' },
          { step: 2, support: '힌트 제공', fadeCondition: '연속 2회 정답 후' },
          { step: 3, support: '격려 메시지', fadeCondition: '항상 제공' }
        ],
        successCriteria: '3개 중 2개 이상 맞추면 성공!'
      },
      satisfaction: {
        strategyType: 'intrinsic_reinforcement',
        rewards: [
          { type: 'praise', description: '칭찬 메시지' },
          { type: 'star', description: '별 보상', pointValue: 10 },
          { type: 'animation', description: '축하 애니메이션' }
        ],
        feedbackType: 'immediate',
        feedbackTemplates: Grade1FeedbackMessages
      }
    };
  }

  /**
   * 기본 UDL 접근성 설정 가져오기
   */
  protected getDefaultUDLSettings(preset?: string): UDLAccessibility {
    // 기본값 사용
    return { ...Grade1DefaultUDLSettings };
  }

  /**
   * 콘텐츠 요소 생성 헬퍼
   */
  protected createContentElement(
    type: ContentElement['type'],
    content: ContentElement['content'],
    order: number
  ): ContentElement {
    return {
      id: `elem-${this.generateId().substring(0, 8)}`,
      type,
      content,
      accessibility: {
        readAloud: true,
        highlightText: true,
        fontSize: 'large'
      },
      order
    };
  }

  /**
   * 상호작용 요소 생성 헬퍼
   */
  protected createInteractionElement(
    type: InteractionElement['type'],
    instruction: string,
    options?: InteractionElement['options']
  ): InteractionElement {
    return {
      id: `int-${this.generateId().substring(0, 8)}`,
      type,
      instruction,
      options,
      feedback: {
        correct: {
          message: this.getRandomFeedback('correct'),
          animation: 'celebrate'
        },
        incorrect: {
          message: this.getRandomFeedback('encouraging'),
          hint: '다시 한번 생각해 볼까요?',
          maxAttempts: 3
        }
      },
      adaptiveDifficulty: {
        enabled: true,
        decreaseOn: 2,
        increaseOn: 3
      }
    };
  }

  /**
   * 랜덤 피드백 메시지 가져오기
   */
  protected getRandomFeedback(type: 'correct' | 'encouraging' | 'hints' | 'completion'): string {
    const messages = Grade1FeedbackMessages[type];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * 콘텐츠 본문 생성
   */
  protected createContentBody(
    type: ContentType,
    elements: ContentElement[],
    interactions?: InteractionElement[],
    estimatedDuration?: number
  ): ContentBody {
    return {
      type,
      duration: {
        estimated: estimatedDuration || 10,
        minimum: Math.max(1, (estimatedDuration || 10) - 5),
        maximum: (estimatedDuration || 10) + 10
      },
      elements,
      interactions
    };
  }

  /**
   * 최종 학습 콘텐츠 조립
   */
  protected assembleLearningContent(
    title: string,
    achievementStandard: AchievementStandardReference,
    bloomLevel: BloomTaxonomy,
    arcsElements: ARCSMotivation,
    content: ContentBody,
    gradeLevel?: GradeLevel,
    accessibility?: UDLAccessibility,
    tags?: string[]
  ): LearningContent {
    return {
      id: this.generateId(),
      title,
      subject: this.subject,
      gradeLevel: gradeLevel || this.createGradeLevel(),
      achievementStandard,
      bloomLevel,
      arcsElements,
      content,
      accessibility: accessibility || this.getDefaultUDLSettings(),
      metadata: this.createMetadata(tags)
    };
  }

  /**
   * 성공 응답 생성
   */
  protected createSuccessResponse(
    content: LearningContent,
    processingTime: number
  ): ContentGenerationResponse {
    return {
      success: true,
      content,
      generationMetadata: {
        processingTime,
        modelVersion: this.version,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * 오류 응답 생성
   */
  protected createErrorResponse(error: string): ContentGenerationResponse {
    return {
      success: false,
      error
    };
  }
}
