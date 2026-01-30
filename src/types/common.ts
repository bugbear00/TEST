/**
 * AI-Edu 콘텐츠 생성 시스템 - 공통 타입 정의
 * 초등 1학년 맞춤형 학습 앱
 */

// ============================================
// 기본 열거형 (Enums)
// ============================================

/** 교과 영역 */
export type Subject = 'korean' | 'math' | 'digital_literacy' | 'integrated_subject';

/** 학기 */
export type Semester = 1 | 2;

/** 콘텐츠 유형 */
export type ContentType = 'lesson' | 'practice' | 'assessment' | 'game' | 'story';

/** 요소 유형 */
export type ElementType = 'text' | 'image' | 'audio' | 'video' | 'animation' | 'character_dialogue';

/** 상호작용 유형 */
export type InteractionType =
  | 'tap_select'
  | 'drag_drop'
  | 'draw'
  | 'voice_input'
  | 'multiple_choice'
  | 'fill_blank'
  | 'matching'
  | 'sorting'
  | 'counting';

/** 캐릭터 감정 */
export type CharacterEmotion = 'happy' | 'curious' | 'encouraging' | 'celebrating' | 'thinking';

/** 글자 크기 */
export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';

/** 피드백 유형 */
export type FeedbackType = 'immediate' | 'delayed' | 'formative';

/** 보상 유형 */
export type RewardType = 'badge' | 'star' | 'character_item' | 'praise' | 'progress';

/** 검토 상태 */
export type ReviewStatus = 'draft' | 'review' | 'approved' | 'published';

/** 핵심 역량 (2022 개정 교육과정) */
export type KeyCompetency =
  | 'self_management'           // 자기관리 역량
  | 'knowledge_information_processing'  // 지식정보처리 역량
  | 'creative_thinking'         // 창의적 사고 역량
  | 'aesthetic_sensibility'     // 심미적 감성 역량
  | 'communication'             // 의사소통 역량
  | 'community';                // 공동체 역량

/** 평가 방법 */
export type AssessmentMethod =
  | 'observation'
  | 'portfolio'
  | 'performance'
  | 'self_assessment'
  | 'peer_assessment'
  | 'written_test';

/** 기초 소양 영역 */
export type LiteracyDomain = 'literacy' | 'numeracy' | 'digital' | 'social_emotional';

/** 숙달 수준 */
export type ProficiencyLevel = 'emerging' | 'developing' | 'proficient' | 'advanced';

/** 색맹 지원 모드 */
export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

/** 입력 방식 */
export type InputMethod = 'touch' | 'voice' | 'keyboard' | 'switch';

/** 응답 형식 */
export type ResponseFormat = 'select' | 'draw' | 'speak' | 'type';

// ============================================
// 공통 인터페이스
// ============================================

/** 학년 정보 */
export interface GradeLevel {
  /** 학년 (1학년 고정) */
  grade: 1;
  /** 학기 */
  semester: Semester;
  /** 단원명 */
  unit?: string;
  /** 주차 (1-17) */
  week?: number;
}

/** 콘텐츠 메타데이터 */
export interface ContentMetadata {
  /** 생성 일시 */
  createdAt: string;
  /** 수정 일시 */
  updatedAt?: string;
  /** 콘텐츠 버전 */
  version: string;
  /** 제작자 */
  author?: string;
  /** 검토 상태 */
  reviewStatus?: ReviewStatus;
  /** 태그 */
  tags?: string[];
  /** 선수 학습 콘텐츠 ID */
  prerequisites?: string[];
  /** 관련 콘텐츠 ID */
  relatedContents?: string[];
}

/** 캐릭터 정보 */
export interface Character {
  /** 캐릭터 이름 */
  name: string;
  /** 캐릭터 감정 */
  emotion?: CharacterEmotion;
  /** 캐릭터 대사 */
  dialogue?: string;
  /** 아바타 URL */
  avatarUrl?: string;
  /** 음성 ID */
  voiceId?: string;
}

/** 소요 시간 */
export interface Duration {
  /** 예상 소요 시간(분) */
  estimated: number;
  /** 최소 소요 시간(분) */
  minimum?: number;
  /** 최대 소요 시간(분) */
  maximum?: number;
}

/** 접근성 옵션 */
export interface ElementAccessibility {
  /** 음성 읽기 지원 */
  readAloud?: boolean;
  /** 텍스트 하이라이트 */
  highlightText?: boolean;
  /** 글자 크기 */
  fontSize?: FontSize;
}
