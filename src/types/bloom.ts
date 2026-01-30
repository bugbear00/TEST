/**
 * Bloom의 교육 목표 분류학 (Revised Bloom's Taxonomy)
 * 초등 1학년 수준에 맞게 조정된 인지적 영역 분류
 */

// ============================================
// Bloom 분류학 열거형
// ============================================

/** Bloom 인지 수준 */
export type BloomLevel =
  | 'remember'    // 기억하기
  | 'understand'  // 이해하기
  | 'apply'       // 적용하기
  | 'analyze'     // 분석하기
  | 'evaluate'    // 평가하기
  | 'create';     // 창조하기

/** Bloom 수준별 설명 (한국어) */
export const BloomLevelDescriptions: Record<BloomLevel, string> = {
  remember: '기억하기 - 이전에 배운 정보를 떠올리기',
  understand: '이해하기 - 의미를 파악하고 설명하기',
  apply: '적용하기 - 배운 것을 새로운 상황에서 사용하기',
  analyze: '분석하기 - 부분들 간의 관계를 파악하기',
  evaluate: '평가하기 - 기준에 따라 판단하기',
  create: '창조하기 - 새로운 것을 만들어내기'
};

/** 초등 1학년 수준별 인지 동사 */
export const BloomCognitiveVerbs: Record<BloomLevel, string[]> = {
  remember: [
    '말하다', '찾다', '가리키다', '이름 말하다', '따라 하다',
    '반복하다', '기억하다', '알다', '인식하다', '확인하다'
  ],
  understand: [
    '설명하다', '비교하다', '구별하다', '예를 들다', '분류하다',
    '요약하다', '표현하다', '나타내다', '묘사하다', '바꿔 말하다'
  ],
  apply: [
    '사용하다', '적용하다', '실행하다', '해결하다', '보여주다',
    '완성하다', '실험하다', '그리다', '만들다', '연습하다'
  ],
  analyze: [
    '비교하다', '대조하다', '구분하다', '분류하다', '조사하다',
    '연결하다', '관계 짓다', '나누다', '정리하다', '구조화하다'
  ],
  evaluate: [
    '판단하다', '선택하다', '결정하다', '평가하다', '추천하다',
    '비평하다', '검증하다', '우선순위 정하다', '점검하다', '토론하다'
  ],
  create: [
    '만들다', '설계하다', '발명하다', '구성하다', '생성하다',
    '계획하다', '조합하다', '개발하다', '상상하다', '창작하다'
  ]
};

// ============================================
// Bloom 분류학 인터페이스
// ============================================

/** Bloom 분류학 설정 */
export interface BloomTaxonomy {
  /** 주요 인지 수준 */
  primaryLevel: BloomLevel;
  /** 보조 인지 수준 */
  secondaryLevel?: BloomLevel;
  /** 관련 인지 동사 */
  cognitiveVerbs?: string[];
}

/** 초등 1학년 권장 Bloom 수준 */
export interface Grade1BloomGuidelines {
  /** 권장 주요 수준 */
  recommendedPrimaryLevels: BloomLevel[];
  /** 수준별 활동 예시 */
  activityExamples: Record<BloomLevel, string[]>;
  /** 교과별 권장 수준 */
  subjectGuidelines: {
    korean: BloomLevel[];
    math: BloomLevel[];
    digital_literacy: BloomLevel[];
    integrated_subject: BloomLevel[];
  };
}

/** 초등 1학년 Bloom 가이드라인 데이터 */
export const Grade1BloomGuidelinesData: Grade1BloomGuidelines = {
  recommendedPrimaryLevels: ['remember', 'understand', 'apply'],
  activityExamples: {
    remember: [
      '글자 따라 쓰기',
      '숫자 읽기',
      '그림 보고 이름 말하기',
      '노래 따라 부르기'
    ],
    understand: [
      '그림 보고 내용 설명하기',
      '비슷한 것 찾기',
      '순서대로 정리하기',
      '규칙 찾기'
    ],
    apply: [
      '배운 글자로 낱말 만들기',
      '덧셈을 이용해 문제 풀기',
      '배운 노래 불러보기',
      '규칙에 맞게 분류하기'
    ],
    analyze: [
      '이야기에서 인물의 마음 찾기',
      '그림의 같은 점과 다른 점 찾기',
      '문제 상황 파악하기'
    ],
    evaluate: [
      '좋은 행동과 나쁜 행동 판단하기',
      '내가 잘한 것 말하기',
      '친구 작품 감상하기'
    ],
    create: [
      '나만의 이야기 만들기',
      '그림 그리기',
      '새로운 규칙 만들기',
      '역할극 하기'
    ]
  },
  subjectGuidelines: {
    korean: ['remember', 'understand', 'apply', 'create'],
    math: ['remember', 'understand', 'apply'],
    digital_literacy: ['remember', 'understand', 'apply'],
    integrated_subject: ['remember', 'understand', 'apply', 'create']
  }
};

// ============================================
// 학습 목표 매핑 인터페이스
// ============================================

/** 학습 목표와 Bloom 수준 매핑 */
export interface LearningObjectiveMapping {
  /** 학습 목표 */
  objective: string;
  /** Bloom 수준 */
  bloomLevel: BloomLevel;
  /** 사용된 인지 동사 */
  cognitiveVerb: string;
  /** 관찰 가능한 행동 */
  observableBehavior: string;
  /** 평가 가능 여부 */
  measurable: boolean;
}

/** 학습 목표 생성 템플릿 */
export interface ObjectiveTemplate {
  /** Bloom 수준 */
  level: BloomLevel;
  /** 템플릿 문장 */
  template: string;
  /** 예시 */
  example: string;
}

/** 초등 1학년용 학습 목표 템플릿 */
export const Grade1ObjectiveTemplates: ObjectiveTemplate[] = [
  {
    level: 'remember',
    template: '학생은 {내용}을/를 {동사}할 수 있다.',
    example: '학생은 자음과 모음의 이름을 말할 수 있다.'
  },
  {
    level: 'understand',
    template: '학생은 {내용}의 의미를 {동사}할 수 있다.',
    example: '학생은 덧셈의 의미를 설명할 수 있다.'
  },
  {
    level: 'apply',
    template: '학생은 {내용}을/를 사용하여 {과제}를 {동사}할 수 있다.',
    example: '학생은 배운 글자를 사용하여 간단한 낱말을 쓸 수 있다.'
  },
  {
    level: 'analyze',
    template: '학생은 {내용}에서 {요소}를 {동사}할 수 있다.',
    example: '학생은 이야기에서 등장인물의 마음을 찾을 수 있다.'
  },
  {
    level: 'evaluate',
    template: '학생은 {기준}에 따라 {내용}을/를 {동사}할 수 있다.',
    example: '학생은 친구의 발표를 듣고 좋은 점을 말할 수 있다.'
  },
  {
    level: 'create',
    template: '학생은 {조건}을/를 바탕으로 {결과물}을/를 {동사}할 수 있다.',
    example: '학생은 주어진 그림을 보고 자신만의 이야기를 만들 수 있다.'
  }
];
