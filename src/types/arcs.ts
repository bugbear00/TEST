/**
 * ARCS 동기 모델 (Keller's ARCS Model of Motivation)
 * 초등 1학년 학습 동기 설계 요소
 */

// ============================================
// ARCS 모델 열거형
// ============================================

/** ARCS 요소 */
export type ARCSElement = 'attention' | 'relevance' | 'confidence' | 'satisfaction';

/** 주의 집중 전략 유형 */
export type AttentionStrategyType =
  | 'perceptual_arousal'   // 지각적 각성 (새로움, 놀라움)
  | 'inquiry_arousal'      // 탐구적 각성 (호기심, 질문)
  | 'variability';         // 다양성 (변화, 다양한 요소)

/** 관련성 전략 유형 */
export type RelevanceStrategyType =
  | 'goal_orientation'     // 목표 지향 (목적 명시)
  | 'motive_matching'      // 동기 부합 (흥미, 선호)
  | 'familiarity';         // 친숙성 (경험 연결)

/** 자신감 전략 유형 */
export type ConfidenceStrategyType =
  | 'learning_requirements' // 학습 요건 (기대 명시)
  | 'success_opportunities' // 성공 기회 (단계적 도전)
  | 'personal_control';     // 개인 통제 (선택권)

/** 만족감 전략 유형 */
export type SatisfactionStrategyType =
  | 'intrinsic_reinforcement' // 내적 강화 (성취감)
  | 'extrinsic_rewards'       // 외적 보상 (배지, 포인트)
  | 'equity';                 // 공정성 (일관된 기준)

/** 애니메이션 효과 유형 */
export type AnimationEffect = 'celebrate' | 'star_burst' | 'character_cheer' | 'confetti';

// ============================================
// ARCS 인터페이스
// ============================================

/** 주의(Attention) 요소 */
export interface AttentionElement {
  /** 전략 유형 */
  strategyType: AttentionStrategyType;
  /** 전략 설명 */
  strategy: string;
  /** 주의 집중 요소들 */
  elements: AttentionFeature[];
}

/** 주의 집중 기능 */
export interface AttentionFeature {
  /** 기능 유형 */
  type: 'animation' | 'character' | 'sound' | 'surprise' | 'mystery' | 'game_element';
  /** 설명 */
  description: string;
  /** 에셋 URL (있는 경우) */
  assetUrl?: string;
  /** 트리거 조건 */
  trigger?: string;
}

/** 관련성(Relevance) 요소 */
export interface RelevanceElement {
  /** 전략 유형 */
  strategyType: RelevanceStrategyType;
  /** 전략 설명 */
  strategy: string;
  /** 실생활 연결점 */
  realWorldConnection: string;
  /** 학생 흥미 연결 */
  studentInterestConnection?: string;
  /** 이전 학습 연결 */
  priorKnowledgeConnection?: string;
}

/** 자신감(Confidence) 요소 */
export interface ConfidenceElement {
  /** 전략 유형 */
  strategyType: ConfidenceStrategyType;
  /** 단계별 지원 요소 */
  scaffolding: ScaffoldingStep[];
  /** 성공 기준 명시 */
  successCriteria: string;
  /** 난이도 조절 옵션 */
  difficultyOptions?: DifficultyOption[];
}

/** 스캐폴딩 단계 */
export interface ScaffoldingStep {
  /** 단계 번호 */
  step: number;
  /** 지원 내용 */
  support: string;
  /** 제거 조건 */
  fadeCondition?: string;
}

/** 난이도 옵션 */
export interface DifficultyOption {
  /** 난이도 레벨 */
  level: 'easy' | 'medium' | 'hard';
  /** 설명 */
  description: string;
  /** 조정 내용 */
  adjustments: string[];
}

/** 만족감(Satisfaction) 요소 */
export interface SatisfactionElement {
  /** 전략 유형 */
  strategyType: SatisfactionStrategyType;
  /** 보상 요소들 */
  rewards: Reward[];
  /** 피드백 유형 */
  feedbackType: 'immediate' | 'delayed' | 'formative';
  /** 피드백 메시지 템플릿 */
  feedbackTemplates?: FeedbackTemplate;
}

/** 보상 */
export interface Reward {
  /** 보상 유형 */
  type: 'badge' | 'star' | 'character_item' | 'praise' | 'progress' | 'sound' | 'animation';
  /** 보상 설명 */
  description: string;
  /** 에셋 URL */
  assetUrl?: string;
  /** 획득 조건 */
  condition?: string;
  /** 포인트 값 */
  pointValue?: number;
}

/** 피드백 템플릿 */
export interface FeedbackTemplate {
  /** 정답 피드백 목록 */
  correct: string[];
  /** 격려 피드백 목록 (오답 시) */
  encouraging: string[];
  /** 힌트 피드백 목록 */
  hints: string[];
  /** 완료 피드백 목록 */
  completion: string[];
}

// ============================================
// 전체 ARCS 설정
// ============================================

/** ARCS 동기 모델 설정 */
export interface ARCSMotivation {
  /** 주의(Attention) */
  attention?: AttentionElement;
  /** 관련성(Relevance) */
  relevance?: RelevanceElement;
  /** 자신감(Confidence) */
  confidence?: ConfidenceElement;
  /** 만족감(Satisfaction) */
  satisfaction?: SatisfactionElement;
}

// ============================================
// 초등 1학년용 ARCS 가이드라인
// ============================================

/** 초등 1학년 ARCS 전략 가이드 */
export interface Grade1ARCSGuidelines {
  attention: {
    recommended: AttentionStrategyType[];
    examples: string[];
    avoidList: string[];
  };
  relevance: {
    recommended: RelevanceStrategyType[];
    connectionTopics: string[];
    examples: string[];
  };
  confidence: {
    recommended: ConfidenceStrategyType[];
    scaffoldingTips: string[];
    successCriteriaExamples: string[];
  };
  satisfaction: {
    recommended: SatisfactionStrategyType[];
    appropriateRewards: string[];
    feedbackGuidelines: string[];
  };
}

/** 초등 1학년 ARCS 가이드라인 데이터 */
export const Grade1ARCSGuidelinesData: Grade1ARCSGuidelines = {
  attention: {
    recommended: ['perceptual_arousal', 'variability'],
    examples: [
      '친근한 캐릭터의 등장과 대화',
      '밝고 화려한 색상과 애니메이션',
      '재미있는 효과음과 배경 음악',
      '터치/드래그 등 직접 참여 요소',
      '이야기 속 모험과 미션'
    ],
    avoidList: [
      '복잡한 UI나 과다한 요소',
      '긴 설명 텍스트',
      '갑작스러운 큰 소리',
      '빠르게 지나가는 화면'
    ]
  },
  relevance: {
    recommended: ['familiarity', 'motive_matching'],
    connectionTopics: [
      '가족과 친구',
      '학교생활',
      '좋아하는 놀이와 장난감',
      '동물과 자연',
      '일상생활 (식사, 청소, 준비)',
      '계절과 날씨'
    ],
    examples: [
      '학교에서 친구 이름 부르기 상황 연결',
      '마트에서 물건 수 세기 상황',
      '좋아하는 동물 캐릭터 활용',
      '가족과 함께하는 일상 에피소드'
    ]
  },
  confidence: {
    recommended: ['success_opportunities', 'learning_requirements'],
    scaffoldingTips: [
      '처음에는 모범 예시 보여주기',
      '단계적으로 힌트 줄이기',
      '틀려도 격려하는 메시지 제공',
      '작은 단위로 나누어 성공 경험 쌓기',
      '반복 연습 기회 제공'
    ],
    successCriteriaExamples: [
      '3개 중 2개 이상 맞추면 성공!',
      '글자를 따라 쓸 수 있으면 성공!',
      '그림을 보고 이야기할 수 있으면 성공!'
    ]
  },
  satisfaction: {
    recommended: ['intrinsic_reinforcement', 'extrinsic_rewards'],
    appropriateRewards: [
      '칭찬 메시지와 캐릭터 반응',
      '별/스티커 모으기',
      '캐릭터 꾸미기 아이템',
      '축하 애니메이션',
      '진행 표시 (색칠되는 그림)'
    ],
    feedbackGuidelines: [
      '즉각적인 피드백 제공',
      '구체적인 칭찬 (예: "글자를 예쁘게 썼어!")',
      '틀렸을 때도 격려 (예: "괜찮아, 다시 해보자!")',
      '노력을 인정하는 메시지',
      '과도한 보상 지양 (내적 동기 저해 방지)'
    ]
  }
};

/** 초등 1학년용 피드백 메시지 기본 세트 */
export const Grade1FeedbackMessages: FeedbackTemplate = {
  correct: [
    '정말 잘했어!',
    '와, 대단해!',
    '맞았어! 최고야!',
    '훌륭해! 계속 잘하고 있어!',
    '멋져! 정답이야!',
    '잘했어! 네가 해냈어!',
    '아주 잘했어!',
    '똑똑하구나!',
    '완벽해!',
    '참 잘했어!'
  ],
  encouraging: [
    '괜찮아, 다시 해보자!',
    '조금만 더 생각해 볼까?',
    '아깝다! 한 번 더 해보자!',
    '잘 하고 있어, 힘내!',
    '실수해도 괜찮아, 다시 도전!',
    '천천히 생각해 보자!',
    '거의 다 왔어!',
    '포기하지 마!',
    '다음엔 분명 맞출 거야!'
  ],
  hints: [
    '힌트를 줄게, 잘 들어봐!',
    '여기를 한번 살펴볼까?',
    '이 부분을 다시 보자!',
    '천천히 하나씩 살펴보자!'
  ],
  completion: [
    '와! 다 끝냈어! 정말 대단해!',
    '축하해! 모든 문제를 풀었어!',
    '멋지게 완료했어!',
    '최고야! 오늘 학습 끝!',
    '잘했어! 오늘도 열심히 했네!'
  ]
};
