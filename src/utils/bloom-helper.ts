/**
 * Bloom 분류학 적용 유틸리티
 * 학습 목표 설정 및 활동 매핑을 위한 헬퍼 함수들
 */

import {
  BloomLevel,
  BloomTaxonomy,
  BloomLevelDescriptions,
  BloomCognitiveVerbs,
  Grade1BloomGuidelinesData,
  LearningObjectiveMapping,
  Grade1ObjectiveTemplates,
  Subject
} from '../types';

/**
 * Bloom 분류학 빌더
 */
export class BloomTaxonomyBuilder {
  private primaryLevel: BloomLevel = 'understand';
  private secondaryLevel?: BloomLevel;
  private cognitiveVerbs: string[] = [];

  /**
   * 주요 인지 수준 설정
   */
  setPrimaryLevel(level: BloomLevel): BloomTaxonomyBuilder {
    this.primaryLevel = level;
    this.cognitiveVerbs = BloomCognitiveVerbs[level].slice(0, 4);
    return this;
  }

  /**
   * 보조 인지 수준 설정
   */
  setSecondaryLevel(level: BloomLevel): BloomTaxonomyBuilder {
    this.secondaryLevel = level;
    return this;
  }

  /**
   * 인지 동사 추가
   */
  addCognitiveVerbs(...verbs: string[]): BloomTaxonomyBuilder {
    this.cognitiveVerbs = [...this.cognitiveVerbs, ...verbs];
    return this;
  }

  /**
   * Bloom 분류학 빌드
   */
  build(): BloomTaxonomy {
    return {
      primaryLevel: this.primaryLevel,
      secondaryLevel: this.secondaryLevel,
      cognitiveVerbs: this.cognitiveVerbs
    };
  }
}

/**
 * Bloom 수준 가져오기
 * 수치(1-6) 또는 문자열을 Bloom 수준으로 변환
 */
export function getBloomLevel(level: number | string): BloomLevel {
  const levels: BloomLevel[] = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];

  if (typeof level === 'number') {
    const index = Math.max(0, Math.min(5, level - 1));
    return levels[index];
  }

  if (levels.includes(level as BloomLevel)) {
    return level as BloomLevel;
  }

  // 한국어 매핑
  const koreanMapping: Record<string, BloomLevel> = {
    '기억': 'remember',
    '기억하기': 'remember',
    '이해': 'understand',
    '이해하기': 'understand',
    '적용': 'apply',
    '적용하기': 'apply',
    '분석': 'analyze',
    '분석하기': 'analyze',
    '평가': 'evaluate',
    '평가하기': 'evaluate',
    '창조': 'create',
    '창조하기': 'create',
    '창작': 'create',
    '만들기': 'create'
  };

  return koreanMapping[level] || 'understand';
}

/**
 * Bloom 수준 설명 가져오기
 */
export function getBloomLevelDescription(level: BloomLevel): string {
  return BloomLevelDescriptions[level];
}

/**
 * Bloom 수준별 인지 동사 가져오기
 */
export function getCognitiveVerbs(level: BloomLevel, count?: number): string[] {
  const verbs = BloomCognitiveVerbs[level];
  return count ? verbs.slice(0, count) : verbs;
}

/**
 * 초등 1학년에 적합한 Bloom 수준인지 확인
 */
export function isAppropriateForGrade1(level: BloomLevel): boolean {
  return Grade1BloomGuidelinesData.recommendedPrimaryLevels.includes(level);
}

/**
 * 교과별 권장 Bloom 수준 가져오기
 */
export function getRecommendedLevelsForSubject(subject: Subject): BloomLevel[] {
  const subjectKey = subject === 'integrated_subject'
    ? 'integrated_subject'
    : subject;
  return Grade1BloomGuidelinesData.subjectGuidelines[subjectKey] || ['remember', 'understand'];
}

/**
 * Bloom 수준에 맞는 활동 예시 가져오기
 */
export function getActivityExamples(level: BloomLevel): string[] {
  return Grade1BloomGuidelinesData.activityExamples[level] || [];
}

/**
 * 학습 목표 생성
 */
export function generateLearningObjective(
  level: BloomLevel,
  content: string,
  verb?: string
): LearningObjectiveMapping {
  const selectedVerb = verb || getCognitiveVerbs(level, 1)[0];
  const template = Grade1ObjectiveTemplates.find(t => t.level === level);

  const objective = template
    ? template.template.replace('{내용}', content).replace('{동사}', selectedVerb)
    : `학생은 ${content}을/를 ${selectedVerb}할 수 있다.`;

  return {
    objective,
    bloomLevel: level,
    cognitiveVerb: selectedVerb,
    observableBehavior: `${content} ${selectedVerb}하는 행동을 관찰할 수 있다.`,
    measurable: true
  };
}

/**
 * 복수의 학습 목표 생성
 */
export function generateMultipleLearningObjectives(
  level: BloomLevel,
  contents: string[]
): LearningObjectiveMapping[] {
  const verbs = getCognitiveVerbs(level);
  return contents.map((content, index) => {
    const verb = verbs[index % verbs.length];
    return generateLearningObjective(level, content, verb);
  });
}

/**
 * Bloom 수준 간 전이 추천
 */
export function recommendNextLevel(currentLevel: BloomLevel): BloomLevel | null {
  const levels: BloomLevel[] = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];
  const currentIndex = levels.indexOf(currentLevel);

  if (currentIndex === -1 || currentIndex >= levels.length - 1) {
    return null;
  }

  const nextLevel = levels[currentIndex + 1];

  // 초등 1학년의 경우 analyze 이상은 권장하지 않음
  if (!isAppropriateForGrade1(nextLevel)) {
    return null;
  }

  return nextLevel;
}

/**
 * 활동에 적합한 Bloom 수준 추천
 */
export function recommendBloomLevelForActivity(activityType: string): BloomLevel {
  const activityLevelMap: Record<string, BloomLevel> = {
    // 기억 수준
    'matching': 'remember',
    'recall': 'remember',
    'recognition': 'remember',
    'identify': 'remember',
    'trace': 'remember',

    // 이해 수준
    'sorting': 'understand',
    'classification': 'understand',
    'comparison': 'understand',
    'explanation': 'understand',
    'summary': 'understand',

    // 적용 수준
    'problem_solving': 'apply',
    'calculation': 'apply',
    'application': 'apply',
    'demonstration': 'apply',
    'practice': 'apply',

    // 분석 수준
    'pattern_finding': 'analyze',
    'relationship': 'analyze',
    'cause_effect': 'analyze',

    // 평가 수준
    'judgment': 'evaluate',
    'selection': 'evaluate',
    'critique': 'evaluate',

    // 창조 수준
    'creation': 'create',
    'design': 'create',
    'storytelling': 'create',
    'drawing': 'create'
  };

  return activityLevelMap[activityType.toLowerCase()] || 'understand';
}

/**
 * 콘텐츠의 Bloom 수준 분석
 */
export function analyzeContentBloomLevel(content: {
  interactions?: Array<{ type: string }>;
  learningObjectives?: string[];
}): { level: BloomLevel; confidence: number; reasoning: string } {
  if (!content.interactions || content.interactions.length === 0) {
    return {
      level: 'remember',
      confidence: 0.5,
      reasoning: '상호작용 요소가 없어 기본 수준으로 분류됨'
    };
  }

  // 상호작용 유형별 수준 매핑
  const interactionLevels: Record<string, BloomLevel> = {
    'tap_select': 'remember',
    'matching': 'understand',
    'sorting': 'understand',
    'drag_drop': 'apply',
    'fill_blank': 'apply',
    'draw': 'create',
    'voice_input': 'apply',
    'counting': 'understand'
  };

  // 가장 높은 수준 찾기
  const levels: BloomLevel[] = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];
  let maxLevel: BloomLevel = 'remember';

  for (const interaction of content.interactions) {
    const level = interactionLevels[interaction.type] || 'remember';
    if (levels.indexOf(level) > levels.indexOf(maxLevel)) {
      maxLevel = level;
    }
  }

  return {
    level: maxLevel,
    confidence: 0.8,
    reasoning: `상호작용 유형 분석 결과 "${maxLevel}" 수준으로 분류됨`
  };
}

/**
 * Bloom 기반 학습 경로 생성
 */
export function createBloomBasedLearningPath(
  topic: string,
  subject: Subject
): Array<{ step: number; level: BloomLevel; objective: string; activity: string }> {
  const recommendedLevels = getRecommendedLevelsForSubject(subject);

  return recommendedLevels.map((level, index) => {
    const verbs = getCognitiveVerbs(level, 1);
    const activities = getActivityExamples(level);

    return {
      step: index + 1,
      level,
      objective: `${topic}을/를 ${verbs[0]}할 수 있다.`,
      activity: activities[Math.floor(Math.random() * activities.length)] || `${level} 활동`
    };
  });
}

/**
 * 검증: 학습 목표가 Bloom 기준에 부합하는지 확인
 */
export function validateLearningObjective(
  objective: string,
  targetLevel: BloomLevel
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // 인지 동사 포함 여부 확인
  const verbs = getCognitiveVerbs(targetLevel);
  const hasVerb = verbs.some(verb => objective.includes(verb));

  if (!hasVerb) {
    issues.push(`목표에 ${targetLevel} 수준의 인지 동사가 포함되어야 합니다. (예: ${verbs.slice(0, 3).join(', ')})`);
  }

  // 측정 가능성 확인 (할 수 있다, 한다 등의 표현)
  const measurablePatterns = ['할 수 있다', '한다', '안다', '이해한다'];
  const isMeasurable = measurablePatterns.some(pattern => objective.includes(pattern));

  if (!isMeasurable) {
    issues.push('목표는 측정 가능한 형태로 작성되어야 합니다. (예: "~할 수 있다")');
  }

  // 초등 1학년 적합성 확인
  if (!isAppropriateForGrade1(targetLevel)) {
    issues.push(`${targetLevel} 수준은 초등 1학년에게 다소 어려울 수 있습니다.`);
  }

  return {
    valid: issues.length === 0,
    issues
  };
}
