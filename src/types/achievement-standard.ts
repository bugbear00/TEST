/**
 * 2022 개정 교육과정 성취 기준 타입 정의
 * 초등 1학년 교과별 성취 기준 매핑
 */

import { Subject, KeyCompetency, AssessmentMethod } from './common';

// ============================================
// 성취 기준 기본 타입
// ============================================

/** 성취 기준 코드 패턴 (예: [1국어01-02]) */
export type AchievementStandardCode = `[${number}${string}${number}-${number}]`;

/** 평가 수준 */
export type PerformanceLevel = 'excellent' | 'good' | 'satisfactory' | 'needs_improvement';

/** 교육과정 정보 */
export interface CurriculumInfo {
  /** 교육과정 개정 연도 */
  year: 2022;
  /** 교육과정 명칭 */
  name: string;
  /** 대상 학년 */
  targetGrade: 1;
}

// ============================================
// 성취 기준 인터페이스
// ============================================

/** 성취 기준 */
export interface AchievementStandard {
  /** 성취 기준 코드 */
  code: string;
  /** 성취 기준 내용 */
  content: string;
  /** 성취 기준 해설 */
  explanation?: string;
  /** 관련 핵심 역량 */
  keyCompetencies?: KeyCompetency[];
  /** 평가 방법 */
  assessmentMethods?: AssessmentMethod[];
  /** 수준별 성취 기술 */
  levelDescriptors?: LevelDescriptors;
}

/** 수준별 성취 기술 */
export interface LevelDescriptors {
  /** 매우 잘함 */
  excellent: string;
  /** 잘함 */
  good: string;
  /** 보통 */
  satisfactory: string;
  /** 노력 요함 */
  needsImprovement: string;
}

/** 콘텐츠에서 사용하는 성취 기준 참조 */
export interface AchievementStandardReference {
  /** 성취 기준 코드 */
  code: string;
  /** 성취 기준 설명 */
  description: string;
  /** 세부 학습 목표 */
  learningObjectives?: string[];
  /** 평가 기준 */
  assessmentCriteria?: AssessmentCriterion[];
}

/** 평가 기준 */
export interface AssessmentCriterion {
  /** 평가 수준 */
  level: 'excellent' | 'good' | 'needs_improvement';
  /** 수준별 기준 설명 */
  description: string;
}

// ============================================
// 영역별 성취 기준
// ============================================

/** 영역별 성취 기준 */
export interface DomainStandards {
  /** 영역 코드 */
  code: string;
  /** 영역명 */
  name: string;
  /** 영역 설명 */
  description?: string;
  /** 성취 기준 목록 */
  standards: AchievementStandard[];
}

/** 교과별 성취 기준 */
export interface SubjectStandards {
  /** 교과명 */
  name: string;
  /** 영역별 성취 기준 */
  domains: DomainStandards[];
}

// ============================================
// 통합교과 성취 기준
// ============================================

/** 통합교과 주제 */
export type IntegratedTheme =
  | '학교'
  | '나'
  | '가족'
  | '마을'
  | '봄'
  | '여름'
  | '가을'
  | '겨울';

/** 통합교과 주제별 성취 기준 */
export interface IntegratedThemeStandards {
  /** 주제 코드 */
  code: string;
  /** 주제명 */
  name: IntegratedTheme;
  /** 학기 */
  semester: 1 | 2;
  /** 성취 기준 목록 */
  standards: AchievementStandard[];
}

/** 통합교과 성취 기준 */
export interface IntegratedSubjectStandards {
  /** 교과명 */
  name: '통합교과';
  /** 주제별 성취 기준 */
  themes: IntegratedThemeStandards[];
}

// ============================================
// 전체 성취 기준 데이터베이스
// ============================================

/** 성취 기준 데이터베이스 */
export interface AchievementStandardsDatabase {
  /** 교육과정 정보 */
  curriculum: CurriculumInfo;
  /** 교과별 성취 기준 */
  subjects: {
    korean?: SubjectStandards;
    math?: SubjectStandards;
    integratedSubject?: IntegratedSubjectStandards;
  };
}

// ============================================
// 초등 1학년 국어 성취 기준 예시 데이터
// ============================================

/** 1학년 국어 성취 기준 샘플 데이터 */
export const KoreanGrade1Standards: SubjectStandards = {
  name: '국어',
  domains: [
    {
      code: '01',
      name: '듣기·말하기',
      description: '일상생활과 학습에 필요한 듣기·말하기 능력을 기른다.',
      standards: [
        {
          code: '[1국어01-01]',
          content: '바른 자세로 듣고 말하며, 고운 말을 사용한다.',
          explanation: '대화할 때 상대방을 바라보고 경청하며, 고운 말을 사용하여 예의 바르게 대화하는 태도를 기른다.',
          keyCompetencies: ['communication', 'community'],
          assessmentMethods: ['observation', 'self_assessment'],
          levelDescriptors: {
            excellent: '바른 자세로 듣고 말하며, 상황에 맞게 고운 말을 적절히 사용한다.',
            good: '바른 자세로 듣고 말하며, 고운 말을 사용하려고 노력한다.',
            satisfactory: '바른 자세로 듣고 말하려고 노력하나, 고운 말 사용이 부족하다.',
            needsImprovement: '바른 자세와 고운 말 사용에 대한 지도가 필요하다.'
          }
        },
        {
          code: '[1국어01-02]',
          content: '인사말을 상황에 맞게 주고받는다.',
          explanation: '다양한 상황에서 적절한 인사말을 사용하여 상대방과 원활하게 소통하는 능력을 기른다.',
          keyCompetencies: ['communication', 'community'],
          assessmentMethods: ['observation', 'performance'],
          levelDescriptors: {
            excellent: '다양한 상황에서 적절한 인사말을 스스로 주고받는다.',
            good: '상황에 맞는 인사말을 주고받을 수 있다.',
            satisfactory: '도움을 받아 상황에 맞는 인사말을 주고받을 수 있다.',
            needsImprovement: '상황에 맞는 인사말 사용에 대한 지도가 필요하다.'
          }
        },
        {
          code: '[1국어01-03]',
          content: '그림이나 사물을 보고 느낌이나 생각을 말한다.',
          explanation: '시각적 자료를 보고 자신의 느낌이나 생각을 자유롭게 표현하는 능력을 기른다.',
          keyCompetencies: ['communication', 'creative_thinking'],
          assessmentMethods: ['observation', 'performance'],
          levelDescriptors: {
            excellent: '그림이나 사물을 보고 자신의 느낌이나 생각을 풍부하게 표현한다.',
            good: '그림이나 사물을 보고 자신의 느낌이나 생각을 말할 수 있다.',
            satisfactory: '도움을 받아 그림이나 사물을 보고 느낌이나 생각을 말할 수 있다.',
            needsImprovement: '그림이나 사물을 보고 느낌이나 생각을 표현하는 데 어려움이 있다.'
          }
        }
      ]
    },
    {
      code: '02',
      name: '읽기',
      description: '글을 읽고 의미를 이해하는 능력을 기른다.',
      standards: [
        {
          code: '[1국어02-01]',
          content: '글자와 소리의 관계를 안다.',
          explanation: '한글의 자음과 모음을 알고, 글자와 소리의 대응 관계를 이해한다.',
          keyCompetencies: ['knowledge_information_processing'],
          assessmentMethods: ['observation', 'written_test'],
          levelDescriptors: {
            excellent: '모든 자음과 모음의 소리와 글자의 관계를 정확히 안다.',
            good: '대부분의 자음과 모음의 소리와 글자의 관계를 안다.',
            satisfactory: '기본적인 자음과 모음의 소리와 글자의 관계를 안다.',
            needsImprovement: '글자와 소리의 관계 이해에 대한 지도가 필요하다.'
          }
        },
        {
          code: '[1국어02-02]',
          content: '낱말과 문장을 소리 내어 읽는다.',
          explanation: '글자를 정확하게 소리 내어 읽어 낱말과 문장을 읽는 능력을 기른다.',
          keyCompetencies: ['knowledge_information_processing', 'communication'],
          assessmentMethods: ['observation', 'performance'],
          levelDescriptors: {
            excellent: '낱말과 문장을 유창하게 소리 내어 읽는다.',
            good: '낱말과 문장을 정확하게 소리 내어 읽는다.',
            satisfactory: '낱말과 간단한 문장을 소리 내어 읽을 수 있다.',
            needsImprovement: '낱말과 문장을 소리 내어 읽는 데 어려움이 있다.'
          }
        }
      ]
    },
    {
      code: '03',
      name: '쓰기',
      description: '생각과 느낌을 글로 표현하는 능력을 기른다.',
      standards: [
        {
          code: '[1국어03-01]',
          content: '글자를 바르게 쓴다.',
          explanation: '한글의 자음과 모음을 익혀 글자를 바른 순서와 모양으로 쓰는 능력을 기른다.',
          keyCompetencies: ['self_management', 'knowledge_information_processing'],
          assessmentMethods: ['portfolio', 'observation'],
          levelDescriptors: {
            excellent: '글자를 바른 순서와 모양으로 정확하고 예쁘게 쓴다.',
            good: '글자를 바른 순서와 모양으로 쓴다.',
            satisfactory: '글자를 쓸 수 있으나 순서나 모양이 부정확할 때가 있다.',
            needsImprovement: '글자 쓰기에 대한 지도가 필요하다.'
          }
        },
        {
          code: '[1국어03-02]',
          content: '자신의 생각을 문장으로 표현한다.',
          explanation: '자신의 생각이나 느낌을 간단한 문장으로 표현하는 능력을 기른다.',
          keyCompetencies: ['communication', 'creative_thinking'],
          assessmentMethods: ['portfolio', 'performance'],
          levelDescriptors: {
            excellent: '자신의 생각을 다양한 문장으로 풍부하게 표현한다.',
            good: '자신의 생각을 문장으로 표현할 수 있다.',
            satisfactory: '도움을 받아 자신의 생각을 문장으로 표현할 수 있다.',
            needsImprovement: '자신의 생각을 문장으로 표현하는 데 어려움이 있다.'
          }
        }
      ]
    }
  ]
};

/** 1학년 수학 성취 기준 샘플 데이터 */
export const MathGrade1Standards: SubjectStandards = {
  name: '수학',
  domains: [
    {
      code: '01',
      name: '수와 연산',
      description: '수의 개념을 이해하고 기초적인 연산 능력을 기른다.',
      standards: [
        {
          code: '[1수학01-01]',
          content: '0부터 9까지의 수 개념을 이해하고, 수를 세고 쓰고 읽을 수 있다.',
          explanation: '한 자리 수의 개념을 구체물을 통해 이해하고 수를 다양한 방식으로 표현한다.',
          keyCompetencies: ['knowledge_information_processing'],
          assessmentMethods: ['observation', 'written_test'],
          levelDescriptors: {
            excellent: '0부터 9까지의 수를 다양한 상황에서 정확하게 세고 쓰고 읽는다.',
            good: '0부터 9까지의 수를 세고 쓰고 읽을 수 있다.',
            satisfactory: '0부터 9까지의 수를 세고 읽을 수 있다.',
            needsImprovement: '0부터 9까지의 수 개념 이해에 대한 지도가 필요하다.'
          }
        },
        {
          code: '[1수학01-02]',
          content: '두 자리 수의 개념을 이해하고, 수를 세고 쓰고 읽을 수 있다.',
          explanation: '십의 개념을 이해하고 두 자리 수의 자릿값을 이해한다.',
          keyCompetencies: ['knowledge_information_processing'],
          assessmentMethods: ['observation', 'written_test'],
          levelDescriptors: {
            excellent: '두 자리 수의 자릿값을 정확히 이해하고 다양하게 표현한다.',
            good: '두 자리 수를 세고 쓰고 읽을 수 있다.',
            satisfactory: '두 자리 수를 읽고 쓸 수 있다.',
            needsImprovement: '두 자리 수의 개념 이해에 대한 지도가 필요하다.'
          }
        },
        {
          code: '[1수학01-03]',
          content: '한 자리 수의 덧셈과 뺄셈을 할 수 있다.',
          explanation: '구체물을 이용하여 덧셈과 뺄셈의 의미를 이해하고 계산한다.',
          keyCompetencies: ['knowledge_information_processing', 'creative_thinking'],
          assessmentMethods: ['written_test', 'performance'],
          levelDescriptors: {
            excellent: '한 자리 수의 덧셈과 뺄셈을 정확하고 빠르게 한다.',
            good: '한 자리 수의 덧셈과 뺄셈을 할 수 있다.',
            satisfactory: '구체물의 도움을 받아 덧셈과 뺄셈을 할 수 있다.',
            needsImprovement: '한 자리 수의 덧셈과 뺄셈에 대한 지도가 필요하다.'
          }
        }
      ]
    },
    {
      code: '02',
      name: '도형',
      description: '기본적인 도형의 개념을 이해한다.',
      standards: [
        {
          code: '[1수학02-01]',
          content: '여러 가지 모양을 알고 구별할 수 있다.',
          explanation: '일상생활에서 볼 수 있는 다양한 모양을 관찰하고 분류한다.',
          keyCompetencies: ['knowledge_information_processing', 'aesthetic_sensibility'],
          assessmentMethods: ['observation', 'performance'],
          levelDescriptors: {
            excellent: '여러 가지 모양의 특징을 정확히 알고 분류한다.',
            good: '여러 가지 모양을 알고 구별할 수 있다.',
            satisfactory: '기본적인 모양을 알고 구별할 수 있다.',
            needsImprovement: '모양 구별에 대한 지도가 필요하다.'
          }
        }
      ]
    },
    {
      code: '03',
      name: '측정',
      description: '양의 비교 방법을 이해한다.',
      standards: [
        {
          code: '[1수학03-01]',
          content: '양을 비교하여 각각의 특성에 맞게 표현할 수 있다.',
          explanation: '길이, 무게, 넓이 등을 비교하는 방법을 이해한다.',
          keyCompetencies: ['knowledge_information_processing'],
          assessmentMethods: ['observation', 'performance'],
          levelDescriptors: {
            excellent: '다양한 양을 정확하게 비교하여 표현한다.',
            good: '양을 비교하여 표현할 수 있다.',
            satisfactory: '도움을 받아 양을 비교할 수 있다.',
            needsImprovement: '양의 비교에 대한 지도가 필요하다.'
          }
        }
      ]
    }
  ]
};

/** 1학년 통합교과 성취 기준 샘플 데이터 */
export const IntegratedGrade1Standards: IntegratedSubjectStandards = {
  name: '통합교과',
  themes: [
    {
      code: 'S01',
      name: '학교',
      semester: 1,
      standards: [
        {
          code: '[1통합01-01]',
          content: '학교의 여러 장소를 알고 안전하게 이용한다.',
          explanation: '학교 시설의 위치와 용도를 알고 안전하게 사용하는 방법을 익힌다.',
          keyCompetencies: ['self_management', 'community'],
          assessmentMethods: ['observation', 'portfolio']
        },
        {
          code: '[1통합01-02]',
          content: '학교에서 만나는 사람들을 알고 바르게 인사한다.',
          explanation: '학교에서 만나는 다양한 사람들의 역할을 알고 예의 바르게 대한다.',
          keyCompetencies: ['communication', 'community'],
          assessmentMethods: ['observation', 'self_assessment']
        }
      ]
    },
    {
      code: 'S02',
      name: '봄',
      semester: 1,
      standards: [
        {
          code: '[1통합02-01]',
          content: '봄의 날씨와 생활의 변화를 탐색한다.',
          explanation: '봄철 날씨의 특징과 그에 따른 생활의 변화를 관찰하고 탐색한다.',
          keyCompetencies: ['knowledge_information_processing', 'creative_thinking'],
          assessmentMethods: ['observation', 'portfolio']
        }
      ]
    }
  ]
};
