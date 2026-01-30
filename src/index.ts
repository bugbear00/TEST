/**
 * AI-Edu 콘텐츠 생성 시스템
 * 초등 1학년 맞춤형 학습 앱 콘텐츠 생성 모듈
 *
 * 설계 원칙:
 * - 2022 개정 교육과정 '기초 소양(언어·수리·디지털)' 강화 방침 준수
 * - ARCS 동기 모델 기반 학습 동기 부여
 * - Bloom의 교육 목표 분류학 기반 학습 목표 설정
 * - UDL(보편적 학습 설계) 원칙 적용
 *
 * @packageDocumentation
 */

// 타입 정의
export * from './types';

// 콘텐츠 생성기
export * from './generators';

// 유틸리티
export * from './utils';

// 편의를 위한 주요 클래스/함수 직접 export
import { ContentGeneratorFactory } from './generators';
import { ARCSBuilder, createGrade1DefaultARCS } from './utils/arcs-helper';
import { BloomTaxonomyBuilder, getBloomLevel, generateLearningObjective } from './utils/bloom-helper';
import { UDLBuilder, getUDLSettingsForPreset, createUDLForLearnerProfile } from './utils/udl-helper';

export {
  // 콘텐츠 생성
  ContentGeneratorFactory,

  // ARCS
  ARCSBuilder,
  createGrade1DefaultARCS,

  // Bloom
  BloomTaxonomyBuilder,
  getBloomLevel,
  generateLearningObjective,

  // UDL
  UDLBuilder,
  getUDLSettingsForPreset,
  createUDLForLearnerProfile
};

/**
 * 콘텐츠 생성 간편 함수
 *
 * @example
 * ```typescript
 * import { generateContent } from 'ai-edu-content-system';
 *
 * const result = await generateContent({
 *   subject: 'korean',
 *   achievementStandardCode: '[1국어02-01]',
 *   contentType: 'lesson',
 *   targetBloomLevel: 'understand',
 *   theme: '가족'
 * });
 *
 * if (result.success) {
 *   console.log('생성된 콘텐츠:', result.content);
 * }
 * ```
 */
export const generateContent = ContentGeneratorFactory.generateContent.bind(ContentGeneratorFactory);
