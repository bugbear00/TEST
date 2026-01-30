/**
 * 학습 활동 타입 정의
 * 초등 1학년 학습 활동 구조 및 게임화 요소
 */

import { LiteracyDomain, ProficiencyLevel, Character } from './common';

// ============================================
// 활동 유형 정의
// ============================================

/** 학습 활동 유형 */
export type ActivityType =
  | 'phonics_practice'      // 파닉스 연습
  | 'reading_comprehension' // 읽기 이해
  | 'writing_practice'      // 쓰기 연습
  | 'number_sense'          // 수 감각
  | 'calculation_drill'     // 연산 연습
  | 'problem_solving'       // 문제 해결
  | 'pattern_recognition'   // 패턴 인식
  | 'digital_navigation'    // 디지털 탐색
  | 'creative_expression'   // 창의적 표현
  | 'collaborative_task';   // 협동 과제

/** 상호작용 동작 유형 */
export type InteractionAction =
  | 'watch'     // 보기
  | 'listen'    // 듣기
  | 'tap'       // 터치/탭
  | 'drag'      // 드래그
  | 'draw'      // 그리기
  | 'speak'     // 말하기
  | 'type'      // 타이핑
  | 'select'    // 선택
  | 'arrange';  // 정렬

/** 검증 유형 */
export type ValidationType =
  | 'exact'         // 정확히 일치
  | 'partial'       // 부분 일치
  | 'fuzzy'         // 유사 일치
  | 'ai_evaluated'  // AI 평가
  | 'self_check';   // 자기 점검

/** 피드백 효과 */
export type FeedbackEffect = 'confetti' | 'stars' | 'character_dance' | 'sound_effect';

/** 보너스 조건 */
export type BonusCondition = 'first_try' | 'no_hints' | 'fast_completion' | 'streak';

/** 캐릭터 아이템 유형 */
export type CharacterItemType = 'hat' | 'accessory' | 'background' | 'pet';

// ============================================
// 목표 기술 인터페이스
// ============================================

/** 목표 기술 */
export interface TargetSkill {
  /** 기초 소양 영역 */
  domain: LiteracyDomain;
  /** 세부 기술 */
  skill: string;
  /** 숙달 수준 */
  level: ProficiencyLevel;
}

// ============================================
// 활동 단계 인터페이스
// ============================================

/** 단계 안내 */
export interface StepInstruction {
  /** 안내 텍스트 */
  text: string;
  /** 안내 음성 URL */
  audioUrl?: string;
  /** 안내 애니메이션 ID */
  animationId?: string;
}

/** 상호작용 검증 */
export interface InteractionValidation {
  /** 검증 유형 */
  type: ValidationType;
  /** 검증 기준 */
  criteria?: Record<string, unknown>;
}

/** 단계 상호작용 */
export interface StepInteraction {
  /** 상호작용 유형 */
  type: InteractionAction;
  /** 상호작용 데이터 */
  data?: Record<string, unknown>;
  /** 검증 설정 */
  validation?: InteractionValidation;
}

/** 성공 피드백 */
export interface SuccessFeedback {
  /** 메시지 */
  message: string;
  /** 음성 URL */
  audioUrl?: string;
  /** 효과 */
  effect?: FeedbackEffect;
}

/** 실패 피드백 */
export interface FailureFeedback {
  /** 메시지 */
  message: string;
  /** 힌트 */
  hint?: string;
  /** 음성 URL */
  audioUrl?: string;
  /** 정답 보여주기 */
  showCorrect?: boolean;
}

/** 단계 피드백 */
export interface StepFeedback {
  /** 성공 시 피드백 */
  onSuccess: SuccessFeedback;
  /** 실패 시 피드백 */
  onFailure: FailureFeedback;
}

/** 활동 단계 */
export interface ActivityStep {
  /** 단계 순서 */
  order: number;
  /** 단계 제목 */
  title?: string;
  /** 단계 안내 */
  instruction: StepInstruction;
  /** 상호작용 설정 */
  interaction: StepInteraction;
  /** 피드백 설정 */
  feedback?: StepFeedback;
  /** 제한 시간(초) */
  timeLimit?: number;
  /** 건너뛰기 허용 */
  skipAllowed?: boolean;
}

// ============================================
// 스캐폴딩 인터페이스
// ============================================

/** 힌트 */
export interface Hint {
  /** 힌트 레벨 (1-3) */
  level: number;
  /** 힌트 내용 */
  content: string;
  /** 힌트 음성 URL */
  audioUrl?: string;
  /** 시각적 힌트 */
  visualHint?: string;
}

/** 모범 답안 */
export interface ModelAnswer {
  /** 표시 조건 (시도 횟수) */
  showAfterAttempts: number;
  /** 내용 */
  content: string;
  /** 시연 URL */
  demonstrationUrl?: string;
}

/** 쉬운 버전 연결 */
export interface SimplifiedVersion {
  /** 사용 가능 여부 */
  available: boolean;
  /** 활동 ID */
  activityId?: string;
}

/** 스캐폴딩 옵션 */
export interface ScaffoldingOptions {
  /** 단계별 힌트 */
  hints?: Hint[];
  /** 모범 답안 */
  modelAnswer?: ModelAnswer;
  /** 쉬운 버전 */
  simplifiedVersion?: SimplifiedVersion;
  /** 또래 도움 요청 가능 */
  peerSupport?: boolean;
}

// ============================================
// 평가 인터페이스
// ============================================

/** 루브릭 수준 */
export interface RubricLevels {
  4: string;
  3: string;
  2: string;
  1: string;
}

/** 루브릭 항목 */
export interface RubricItem {
  /** 평가 기준 */
  criterion: string;
  /** 가중치 */
  weight: number;
  /** 수준별 설명 */
  levels: RubricLevels;
}

/** 재시도 정책 */
export interface RetryPolicy {
  /** 최대 재시도 횟수 */
  maxRetries: number;
  /** 대기 시간(분) */
  cooldownMinutes?: number;
}

/** 진행 추적 */
export interface ProgressTracking {
  /** 시간 추적 */
  trackTime?: boolean;
  /** 시도 횟수 추적 */
  trackAttempts?: boolean;
  /** 힌트 사용 추적 */
  trackHintsUsed?: boolean;
}

/** 활동 평가 */
export interface ActivityAssessment {
  /** 루브릭 */
  rubric?: RubricItem[];
  /** 통과 점수 */
  passingScore?: number;
  /** 재시도 정책 */
  retryPolicy?: RetryPolicy;
  /** 진행 추적 */
  progressTracking?: ProgressTracking;
}

// ============================================
// 게임화 인터페이스
// ============================================

/** 보너스 조건 */
export interface BonusConditionItem {
  /** 조건 */
  condition: BonusCondition;
  /** 보너스 포인트 */
  bonusPoints: number;
}

/** 포인트 설정 */
export interface PointsConfig {
  /** 기본 보상 */
  baseReward: number;
  /** 보너스 조건 */
  bonusConditions?: BonusConditionItem[];
}

/** 배지 */
export interface Badge {
  /** 배지 ID */
  id: string;
  /** 배지 이름 */
  name: string;
  /** 이미지 URL */
  imageUrl?: string;
  /** 획득 조건 */
  condition?: string;
}

/** 연속 보너스 */
export interface StreakBonus {
  /** 활성화 여부 */
  enabled: boolean;
  /** 배수 */
  multiplier?: number;
}

/** 캐릭터 아이템 해금 */
export interface CharacterUnlock {
  /** 캐릭터 ID */
  characterId: string;
  /** 아이템 유형 */
  itemType: CharacterItemType;
  /** 해금 조건 */
  unlockCondition?: string;
}

/** 게임화 요소 */
export interface GamificationElements {
  /** 포인트 */
  points?: PointsConfig;
  /** 배지 */
  badges?: Badge[];
  /** 연속 보너스 */
  streakBonus?: StreakBonus;
  /** 캐릭터 아이템 해금 */
  characterUnlocks?: CharacterUnlock[];
}

// ============================================
// 학습 활동 전체 인터페이스
// ============================================

/** 학습 활동 */
export interface LearningActivity {
  /** 활동 고유 식별자 */
  id: string;
  /** 활동 유형 */
  type: ActivityType;
  /** 활동 제목 */
  title: string;
  /** 활동 설명 */
  description?: string;
  /** 안내 캐릭터 */
  character?: Character;
  /** 목표 기술 */
  targetSkills: TargetSkill[];
  /** 활동 단계 */
  steps: ActivityStep[];
  /** 스캐폴딩 옵션 */
  scaffolding?: ScaffoldingOptions;
  /** 평가 설정 */
  assessment?: ActivityAssessment;
  /** 게임화 요소 */
  gamification?: GamificationElements;
}

// ============================================
// 활동 템플릿 인터페이스
// ============================================

/** 활동 템플릿 */
export interface ActivityTemplate {
  /** 템플릿 ID */
  id: string;
  /** 템플릿 이름 */
  name: string;
  /** 활동 유형 */
  activityType: ActivityType;
  /** 기본 설정 */
  defaultConfig: Partial<LearningActivity>;
  /** 필수 필드 */
  requiredFields: string[];
  /** 사용 가능한 상호작용 */
  availableInteractions: InteractionAction[];
}

/** 초등 1학년 활동 템플릿 목록 */
export const Grade1ActivityTemplates: ActivityTemplate[] = [
  {
    id: 'phonics-basic',
    name: '기초 파닉스 연습',
    activityType: 'phonics_practice',
    defaultConfig: {
      targetSkills: [
        { domain: 'literacy', skill: '자음과 모음 인식', level: 'emerging' }
      ]
    },
    requiredFields: ['title', 'steps'],
    availableInteractions: ['listen', 'tap', 'speak', 'select']
  },
  {
    id: 'number-counting',
    name: '수 세기 연습',
    activityType: 'number_sense',
    defaultConfig: {
      targetSkills: [
        { domain: 'numeracy', skill: '수 세기', level: 'emerging' }
      ]
    },
    requiredFields: ['title', 'steps'],
    availableInteractions: ['tap', 'drag', 'select', 'type']
  },
  {
    id: 'writing-trace',
    name: '글자 따라 쓰기',
    activityType: 'writing_practice',
    defaultConfig: {
      targetSkills: [
        { domain: 'literacy', skill: '글자 쓰기', level: 'emerging' }
      ]
    },
    requiredFields: ['title', 'steps'],
    availableInteractions: ['draw', 'watch']
  },
  {
    id: 'story-comprehension',
    name: '이야기 이해하기',
    activityType: 'reading_comprehension',
    defaultConfig: {
      targetSkills: [
        { domain: 'literacy', skill: '이야기 이해', level: 'developing' }
      ]
    },
    requiredFields: ['title', 'steps'],
    availableInteractions: ['listen', 'watch', 'select', 'speak']
  }
];
