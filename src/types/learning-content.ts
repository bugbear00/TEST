/**
 * 학습 콘텐츠 타입 정의
 * 초등 1학년 학습 콘텐츠의 전체 구조
 */

import {
  Subject,
  ContentType,
  ElementType,
  InteractionType,
  CharacterEmotion,
  FontSize,
  FeedbackType,
  GradeLevel,
  ContentMetadata,
  Character,
  Duration,
  ElementAccessibility
} from './common';
import { BloomTaxonomy } from './bloom';
import { ARCSMotivation, AnimationEffect } from './arcs';
import { UDLAccessibility } from './udl';
import { AchievementStandardReference } from './achievement-standard';

// ============================================
// 콘텐츠 요소 인터페이스
// ============================================

/** 콘텐츠 텍스트 내용 */
export interface ContentText {
  /** 텍스트 내용 */
  text: string;
  /** 음성 파일 URL */
  audioUrl?: string;
  /** 이미지 URL */
  imageUrl?: string;
  /** 대체 텍스트 (접근성) */
  altText?: string;
}

/** 캐릭터 콘텐츠 */
export interface CharacterContent {
  /** 캐릭터 이름 */
  name: string;
  /** 캐릭터 감정 */
  emotion: CharacterEmotion;
  /** 캐릭터 대사 */
  dialogue: string;
  /** 아바타 URL */
  avatarUrl?: string;
}

/** 콘텐츠 내용물 */
export interface ContentData {
  /** 텍스트 내용 */
  text?: string;
  /** 음성 파일 URL */
  audioUrl?: string;
  /** 이미지 URL */
  imageUrl?: string;
  /** 대체 텍스트 */
  altText?: string;
  /** 캐릭터 정보 */
  character?: CharacterContent;
}

/** 콘텐츠 요소 */
export interface ContentElement {
  /** 요소 식별자 */
  id: string;
  /** 요소 유형 */
  type: ElementType;
  /** 요소 내용 */
  content: ContentData;
  /** 접근성 옵션 */
  accessibility?: ElementAccessibility;
  /** 표시 순서 */
  order: number;
}

// ============================================
// 상호작용 요소 인터페이스
// ============================================

/** 선택지 */
export interface InteractionOption {
  /** 선택지 ID */
  id: string;
  /** 선택지 내용 */
  content: string;
  /** 이미지 URL */
  imageUrl?: string;
  /** 정답 여부 */
  isCorrect: boolean;
}

/** 정답 피드백 */
export interface CorrectFeedback {
  /** 피드백 메시지 */
  message: string;
  /** 음성 URL */
  audioUrl?: string;
  /** 애니메이션 효과 */
  animation?: AnimationEffect;
}

/** 오답 피드백 */
export interface IncorrectFeedback {
  /** 피드백 메시지 */
  message: string;
  /** 힌트 메시지 */
  hint?: string;
  /** 음성 URL */
  audioUrl?: string;
  /** 최대 시도 횟수 */
  maxAttempts?: number;
}

/** 상호작용 피드백 */
export interface InteractionFeedback {
  /** 정답 피드백 */
  correct: CorrectFeedback;
  /** 오답 피드백 */
  incorrect: IncorrectFeedback;
}

/** 적응형 난이도 조절 */
export interface AdaptiveDifficulty {
  /** 활성화 여부 */
  enabled: boolean;
  /** 연속 오답 시 난이도 하향 횟수 */
  decreaseOn?: number;
  /** 연속 정답 시 난이도 상향 횟수 */
  increaseOn?: number;
}

/** 상호작용 요소 */
export interface InteractionElement {
  /** 상호작용 요소 ID */
  id: string;
  /** 상호작용 유형 */
  type: InteractionType;
  /** 활동 안내 */
  instruction: string;
  /** 안내 음성 URL */
  instructionAudio?: string;
  /** 선택지 목록 */
  options?: InteractionOption[];
  /** 피드백 설정 */
  feedback?: InteractionFeedback;
  /** 적응형 난이도 조절 */
  adaptiveDifficulty?: AdaptiveDifficulty;
}

// ============================================
// 콘텐츠 본문 인터페이스
// ============================================

/** 콘텐츠 본문 */
export interface ContentBody {
  /** 콘텐츠 유형 */
  type: ContentType;
  /** 소요 시간 */
  duration?: Duration;
  /** 콘텐츠 구성 요소 */
  elements: ContentElement[];
  /** 상호작용 요소 */
  interactions?: InteractionElement[];
}

// ============================================
// 학습 콘텐츠 전체 인터페이스
// ============================================

/** 학습 콘텐츠 */
export interface LearningContent {
  /** 콘텐츠 고유 식별자 */
  id: string;
  /** 학습 콘텐츠 제목 */
  title: string;
  /** 교과 영역 */
  subject: Subject;
  /** 학년 정보 */
  gradeLevel?: GradeLevel;
  /** 성취 기준 */
  achievementStandard: AchievementStandardReference;
  /** Bloom 분류학 수준 */
  bloomLevel: BloomTaxonomy;
  /** ARCS 동기 요소 */
  arcsElements: ARCSMotivation;
  /** 콘텐츠 본문 */
  content: ContentBody;
  /** 접근성 설정 */
  accessibility?: UDLAccessibility;
  /** 메타데이터 */
  metadata: ContentMetadata;
}

// ============================================
// 콘텐츠 생성 요청 인터페이스
// ============================================

/** 콘텐츠 생성 요청 */
export interface ContentGenerationRequest {
  /** 교과 */
  subject: Subject;
  /** 성취 기준 코드 */
  achievementStandardCode: string;
  /** 콘텐츠 유형 */
  contentType: ContentType;
  /** Bloom 목표 수준 */
  targetBloomLevel?: string;
  /** 테마/주제 */
  theme?: string;
  /** 캐릭터 사용 여부 */
  useCharacter?: boolean;
  /** 예상 소요 시간(분) */
  estimatedDuration?: number;
  /** 접근성 프리셋 */
  accessibilityPreset?: 'default' | 'low_vision' | 'dyslexia' | 'adhd';
}

/** 콘텐츠 생성 응답 */
export interface ContentGenerationResponse {
  /** 성공 여부 */
  success: boolean;
  /** 생성된 콘텐츠 */
  content?: LearningContent;
  /** 오류 메시지 */
  error?: string;
  /** 생성 메타데이터 */
  generationMetadata?: {
    /** 처리 시간(ms) */
    processingTime: number;
    /** AI 모델 버전 */
    modelVersion: string;
    /** 생성 타임스탬프 */
    timestamp: string;
  };
}

// ============================================
// 콘텐츠 검증 인터페이스
// ============================================

/** 콘텐츠 검증 결과 */
export interface ContentValidationResult {
  /** 유효성 여부 */
  isValid: boolean;
  /** 오류 목록 */
  errors: ValidationError[];
  /** 경고 목록 */
  warnings: ValidationWarning[];
}

/** 검증 오류 */
export interface ValidationError {
  /** 오류 코드 */
  code: string;
  /** 오류 메시지 */
  message: string;
  /** 오류 위치 (JSON 경로) */
  path: string;
}

/** 검증 경고 */
export interface ValidationWarning {
  /** 경고 코드 */
  code: string;
  /** 경고 메시지 */
  message: string;
  /** 경고 위치 */
  path: string;
  /** 권장 조치 */
  recommendation?: string;
}
