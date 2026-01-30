/**
 * ARCS 동기 모델 적용 유틸리티
 * 학습 콘텐츠에 동기 부여 요소를 적용하는 헬퍼 함수들
 */

import {
  ARCSMotivation,
  AttentionElement,
  RelevanceElement,
  ConfidenceElement,
  SatisfactionElement,
  Reward,
  FeedbackTemplate,
  Grade1ARCSGuidelinesData,
  Grade1FeedbackMessages,
  AttentionStrategyType,
  RelevanceStrategyType,
  ConfidenceStrategyType,
  SatisfactionStrategyType
} from '../types';

/**
 * ARCS 동기 요소 빌더
 */
export class ARCSBuilder {
  private attention?: AttentionElement;
  private relevance?: RelevanceElement;
  private confidence?: ConfidenceElement;
  private satisfaction?: SatisfactionElement;

  /**
   * 주의(Attention) 요소 설정
   */
  withAttention(
    strategyType: AttentionStrategyType,
    strategy: string,
    elements: AttentionElement['elements']
  ): ARCSBuilder {
    this.attention = {
      strategyType,
      strategy,
      elements
    };
    return this;
  }

  /**
   * 관련성(Relevance) 요소 설정
   */
  withRelevance(
    strategyType: RelevanceStrategyType,
    strategy: string,
    realWorldConnection: string,
    studentInterestConnection?: string
  ): ARCSBuilder {
    this.relevance = {
      strategyType,
      strategy,
      realWorldConnection,
      studentInterestConnection
    };
    return this;
  }

  /**
   * 자신감(Confidence) 요소 설정
   */
  withConfidence(
    strategyType: ConfidenceStrategyType,
    successCriteria: string,
    scaffoldingSteps: ConfidenceElement['scaffolding']
  ): ARCSBuilder {
    this.confidence = {
      strategyType,
      scaffolding: scaffoldingSteps,
      successCriteria
    };
    return this;
  }

  /**
   * 만족감(Satisfaction) 요소 설정
   */
  withSatisfaction(
    strategyType: SatisfactionStrategyType,
    rewards: Reward[],
    feedbackType: 'immediate' | 'delayed' | 'formative' = 'immediate'
  ): ARCSBuilder {
    this.satisfaction = {
      strategyType,
      rewards,
      feedbackType,
      feedbackTemplates: Grade1FeedbackMessages
    };
    return this;
  }

  /**
   * ARCS 동기 요소 빌드
   */
  build(): ARCSMotivation {
    return {
      attention: this.attention,
      relevance: this.relevance,
      confidence: this.confidence,
      satisfaction: this.satisfaction
    };
  }
}

/**
 * 초등 1학년 기본 ARCS 설정 생성
 */
export function createGrade1DefaultARCS(theme?: string): ARCSMotivation {
  return new ARCSBuilder()
    .withAttention(
      'perceptual_arousal',
      '친근한 캐릭터와 밝은 시각 요소로 흥미 유발',
      [
        { type: 'character', description: '안내 캐릭터의 친근한 대화' },
        { type: 'animation', description: '학습 요소 등장 애니메이션' },
        { type: 'sound', description: '재미있는 효과음' }
      ]
    )
    .withRelevance(
      'familiarity',
      '일상생활 경험과 연결',
      theme || '학교와 가정에서의 일상 경험',
      '또래 친구들과의 활동'
    )
    .withConfidence(
      'success_opportunities',
      '3개 중 2개 이상 맞추면 성공!',
      [
        { step: 1, support: '모범 예시 보여주기', fadeCondition: '첫 정답 후' },
        { step: 2, support: '단계별 힌트 제공', fadeCondition: '연속 2회 정답 후' },
        { step: 3, support: '격려 메시지', fadeCondition: '항상 제공' }
      ]
    )
    .withSatisfaction(
      'intrinsic_reinforcement',
      [
        { type: 'praise', description: '칭찬 메시지' },
        { type: 'star', description: '별 보상', pointValue: 10 },
        { type: 'animation', description: '축하 애니메이션' }
      ],
      'immediate'
    )
    .build();
}

/**
 * 테마별 ARCS 설정 생성
 */
export function createThemeBasedARCS(theme: string): ARCSMotivation {
  const themeConnections: Record<string, { attention: string; relevance: string }> = {
    가족: {
      attention: '가족과 함께하는 따뜻한 이야기',
      relevance: '우리 가족과의 추억'
    },
    학교: {
      attention: '학교에서 친구들과의 즐거운 활동',
      relevance: '매일 가는 학교에서의 경험'
    },
    동물: {
      attention: '귀여운 동물 친구들의 모험',
      relevance: '좋아하는 동물과 펫 이야기'
    },
    자연: {
      attention: '아름다운 자연 속 탐험',
      relevance: '밖에서 놀 때 만나는 것들'
    }
  };

  const connection = themeConnections[theme] || {
    attention: '재미있는 이야기와 활동',
    relevance: '일상생활 경험'
  };

  return new ARCSBuilder()
    .withAttention(
      'perceptual_arousal',
      connection.attention,
      [
        { type: 'character', description: `${theme} 관련 캐릭터 등장` },
        { type: 'animation', description: '테마 맞춤 애니메이션' },
        { type: 'sound', description: '테마 관련 효과음' }
      ]
    )
    .withRelevance(
      'familiarity',
      '학생의 일상 경험과 연결',
      connection.relevance,
      `${theme}에 대한 학생의 관심`
    )
    .withConfidence(
      'success_opportunities',
      '작은 단계로 나누어 성공 경험 쌓기',
      [
        { step: 1, support: '쉬운 예제로 시작', fadeCondition: '첫 성공 후' },
        { step: 2, support: '점진적 난이도 상승', fadeCondition: '연속 성공 후' }
      ]
    )
    .withSatisfaction(
      'intrinsic_reinforcement',
      [
        { type: 'praise', description: '구체적인 칭찬' },
        { type: 'character_item', description: `${theme} 테마 아이템 획득` },
        { type: 'progress', description: '진행 상황 시각화' }
      ],
      'immediate'
    )
    .build();
}

/**
 * 콘텐츠 유형별 ARCS 조정
 */
export function adjustARCSForContentType(
  baseARCS: ARCSMotivation,
  contentType: string
): ARCSMotivation {
  const adjusted = { ...baseARCS };

  switch (contentType) {
    case 'game':
      // 게임형 콘텐츠: 도전과 보상 강화
      if (adjusted.satisfaction) {
        adjusted.satisfaction.rewards = [
          ...adjusted.satisfaction.rewards,
          { type: 'badge', description: '도전 완료 배지', pointValue: 20 }
        ];
      }
      break;
    case 'story':
      // 이야기형 콘텐츠: 몰입감 강화
      if (adjusted.attention) {
        adjusted.attention.elements = [
          ...adjusted.attention.elements,
          { type: 'mystery', description: '이야기 속 수수께끼' }
        ];
      }
      break;
    case 'practice':
      // 연습형 콘텐츠: 자신감 구축 강화
      if (adjusted.confidence) {
        adjusted.confidence.scaffolding = [
          ...adjusted.confidence.scaffolding,
          { step: 4, support: '반복 연습 기회', fadeCondition: '요청 시' }
        ];
      }
      break;
    case 'assessment':
      // 평가형 콘텐츠: 불안 감소, 격려 강화
      if (adjusted.confidence) {
        adjusted.confidence.successCriteria = '최선을 다하면 성공!';
      }
      break;
  }

  return adjusted;
}

/**
 * 피드백 메시지 생성
 */
export function generateFeedback(
  isCorrect: boolean,
  attemptCount: number,
  customMessages?: Partial<FeedbackTemplate>
): { message: string; hint?: string } {
  const messages = customMessages
    ? { ...Grade1FeedbackMessages, ...customMessages }
    : Grade1FeedbackMessages;

  if (isCorrect) {
    const correctMessages = messages.correct;
    return {
      message: correctMessages[Math.floor(Math.random() * correctMessages.length)]
    };
  } else {
    const encouragingMessages = messages.encouraging;
    const hints = messages.hints;
    return {
      message: encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)],
      hint: attemptCount >= 2 ? hints[Math.floor(Math.random() * hints.length)] : undefined
    };
  }
}

/**
 * 완료 피드백 생성
 */
export function generateCompletionFeedback(
  score: number,
  totalQuestions: number
): string {
  const percentage = (score / totalQuestions) * 100;
  const completionMessages = Grade1FeedbackMessages.completion;

  if (percentage === 100) {
    return '완벽해요! 모두 맞았어요! 🌟';
  } else if (percentage >= 80) {
    return completionMessages[Math.floor(Math.random() * completionMessages.length)];
  } else if (percentage >= 60) {
    return '잘했어요! 조금만 더 연습하면 완벽해질 거예요!';
  } else {
    return '노력했어요! 다시 한번 도전해 볼까요?';
  }
}

/**
 * 보상 계산
 */
export function calculateRewards(
  isCorrect: boolean,
  attemptCount: number,
  hintsUsed: number,
  timeSpent: number,
  expectedTime: number
): { points: number; bonuses: string[] } {
  let points = 0;
  const bonuses: string[] = [];

  if (isCorrect) {
    // 기본 점수
    points = 10;

    // 첫 시도 보너스
    if (attemptCount === 1) {
      points += 5;
      bonuses.push('첫 시도 성공!');
    }

    // 힌트 미사용 보너스
    if (hintsUsed === 0) {
      points += 3;
      bonuses.push('힌트 없이 성공!');
    }

    // 빠른 완료 보너스
    if (timeSpent < expectedTime * 0.7) {
      points += 2;
      bonuses.push('빠른 해결!');
    }
  } else {
    // 노력 점수
    points = 2;
  }

  return { points, bonuses };
}

/**
 * ARCS 점검 리스트 생성
 */
export function generateARCSChecklist(arcs: ARCSMotivation): {
  element: string;
  present: boolean;
  recommendation?: string;
}[] {
  const checklist: { element: string; present: boolean; recommendation?: string }[] = [];

  // Attention 점검
  checklist.push({
    element: 'Attention (주의)',
    present: !!arcs.attention,
    recommendation: !arcs.attention
      ? '캐릭터, 애니메이션 또는 효과음을 추가하세요.'
      : undefined
  });

  // Relevance 점검
  checklist.push({
    element: 'Relevance (관련성)',
    present: !!arcs.relevance?.realWorldConnection,
    recommendation: !arcs.relevance?.realWorldConnection
      ? '실생활 연결점을 명시하세요.'
      : undefined
  });

  // Confidence 점검
  checklist.push({
    element: 'Confidence (자신감)',
    present: !!(arcs.confidence?.scaffolding && arcs.confidence.scaffolding.length > 0),
    recommendation: !(arcs.confidence?.scaffolding && arcs.confidence.scaffolding.length > 0)
      ? '단계별 힌트와 지원을 추가하세요.'
      : undefined
  });

  // Satisfaction 점검
  checklist.push({
    element: 'Satisfaction (만족감)',
    present: !!(arcs.satisfaction?.rewards && arcs.satisfaction.rewards.length > 0),
    recommendation: !(arcs.satisfaction?.rewards && arcs.satisfaction.rewards.length > 0)
      ? '보상과 피드백 요소를 추가하세요.'
      : undefined
  });

  return checklist;
}
