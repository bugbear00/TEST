/**
 * UDL (보편적 학습 설계) 적용 유틸리티
 * 접근성과 다양한 학습 방식 지원을 위한 헬퍼 함수들
 */

import {
  UDLAccessibility,
  RepresentationOptions,
  ActionOptions,
  EngagementOptions,
  DisplayOptions,
  Grade1DefaultUDLSettings,
  LowVisionUDLSettings,
  DyslexiaUDLSettings,
  ADHDUDLSettings,
  FontSize,
  ColorBlindMode,
  InputMethod,
  ResponseFormat
} from '../types';

/** UDL 프리셋 유형 */
export type UDLPreset = 'default' | 'low_vision' | 'dyslexia' | 'adhd' | 'custom';

/**
 * UDL 설정 빌더
 */
export class UDLBuilder {
  private settings: UDLAccessibility;

  constructor() {
    this.settings = { ...Grade1DefaultUDLSettings };
  }

  /**
   * 프리셋 적용
   */
  applyPreset(preset: UDLPreset): UDLBuilder {
    switch (preset) {
      case 'low_vision':
        this.settings = this.mergeSettings(this.settings, LowVisionUDLSettings);
        break;
      case 'dyslexia':
        this.settings = this.mergeSettings(this.settings, DyslexiaUDLSettings);
        break;
      case 'adhd':
        this.settings = this.mergeSettings(this.settings, ADHDUDLSettings);
        break;
      default:
        this.settings = { ...Grade1DefaultUDLSettings };
    }
    return this;
  }

  /**
   * 표현 방식 설정
   */
  setRepresentation(options: Partial<RepresentationOptions>): UDLBuilder {
    this.settings.representation = {
      ...this.settings.representation,
      ...options
    };
    return this;
  }

  /**
   * 참여 방식 설정
   */
  setEngagement(options: Partial<EngagementOptions>): UDLBuilder {
    this.settings.engagement = {
      ...this.settings.engagement,
      ...options
    };
    return this;
  }

  /**
   * 행동/표현 방식 설정
   */
  setAction(options: Partial<ActionOptions>): UDLBuilder {
    this.settings.action = {
      ...this.settings.action,
      ...options
    };
    return this;
  }

  /**
   * 화면 표시 설정
   */
  setDisplay(options: Partial<DisplayOptions>): UDLBuilder {
    this.settings.display = {
      ...this.settings.display,
      ...options
    };
    return this;
  }

  /**
   * 텍스트 음성 변환 설정
   */
  enableTextToSpeech(speechRate: 'slow' | 'normal' | 'fast' = 'normal'): UDLBuilder {
    this.settings.representation.textToSpeech = true;
    if (this.settings.representation.languageOptions) {
      this.settings.representation.languageOptions.speechRate = speechRate;
    }
    return this;
  }

  /**
   * 시각적 보조 설정
   */
  enableVisualSupports(): UDLBuilder {
    this.settings.representation.visualSupports = true;
    return this;
  }

  /**
   * 글자 크기 설정
   */
  setFontSize(size: FontSize): UDLBuilder {
    this.settings.display.fontSize = size;
    return this;
  }

  /**
   * 고대비 모드 설정
   */
  enableHighContrast(): UDLBuilder {
    this.settings.display.highContrast = true;
    return this;
  }

  /**
   * 색맹 지원 모드 설정
   */
  setColorBlindMode(mode: ColorBlindMode): UDLBuilder {
    this.settings.display.colorBlindMode = mode;
    return this;
  }

  /**
   * 입력 방식 설정
   */
  setInputMethods(methods: InputMethod[]): UDLBuilder {
    this.settings.action.inputMethods = methods;
    return this;
  }

  /**
   * 응답 형식 설정
   */
  setResponseFormats(formats: ResponseFormat[]): UDLBuilder {
    this.settings.action.responseFormats = formats;
    return this;
  }

  /**
   * 자기 속도 학습 설정
   */
  enableSelfPacedLearning(): UDLBuilder {
    this.settings.engagement.selfPacedLearning = true;
    if (this.settings.action.timingOptions) {
      this.settings.action.timingOptions.unlimitedTime = true;
    }
    return this;
  }

  /**
   * 쉬는 시간 알림 설정
   */
  enableBreakReminders(intervalMinutes: number = 15): UDLBuilder {
    if (this.settings.action.timingOptions) {
      this.settings.action.timingOptions.breakReminders = true;
      this.settings.action.timingOptions.breakInterval = intervalMinutes;
    }
    return this;
  }

  /**
   * 설정 빌드
   */
  build(): UDLAccessibility {
    return { ...this.settings };
  }

  /**
   * 설정 병합 헬퍼
   */
  private mergeSettings(
    base: UDLAccessibility,
    override: Partial<UDLAccessibility>
  ): UDLAccessibility {
    return {
      representation: { ...base.representation, ...override.representation },
      engagement: { ...base.engagement, ...override.engagement },
      action: { ...base.action, ...override.action },
      display: { ...base.display, ...override.display }
    };
  }
}

/**
 * 프리셋별 UDL 설정 가져오기
 */
export function getUDLSettingsForPreset(preset: UDLPreset): UDLAccessibility {
  return new UDLBuilder().applyPreset(preset).build();
}

/**
 * 학습자 프로필 기반 UDL 설정 생성
 */
export function createUDLForLearnerProfile(profile: {
  visualNeeds?: 'normal' | 'low_vision' | 'color_blind';
  readingLevel?: 'emerging' | 'developing' | 'proficient';
  attentionSpan?: 'short' | 'moderate' | 'long';
  preferredInputs?: InputMethod[];
  preferredResponses?: ResponseFormat[];
}): UDLAccessibility {
  const builder = new UDLBuilder();

  // 시각적 요구 처리
  if (profile.visualNeeds === 'low_vision') {
    builder.applyPreset('low_vision');
  } else if (profile.visualNeeds === 'color_blind') {
    builder.setColorBlindMode('protanopia');
  }

  // 읽기 수준 처리
  if (profile.readingLevel === 'emerging') {
    builder.enableTextToSpeech('slow');
    builder.setRepresentation({
      simplifiedLanguage: true,
      multipleFormats: ['audio', 'image', 'animation', 'text']
    });
  }

  // 주의 집중 시간 처리
  if (profile.attentionSpan === 'short') {
    builder.enableBreakReminders(10);
    builder.setEngagement({
      selfPacedLearning: true,
      selfRegulationSupport: {
        goalSetting: true,
        progressVisualization: true,
        selfAssessmentChecklist: false,
        emotionCheckIn: true
      }
    });
  }

  // 선호 입력 방식
  if (profile.preferredInputs) {
    builder.setInputMethods(profile.preferredInputs);
  }

  // 선호 응답 형식
  if (profile.preferredResponses) {
    builder.setResponseFormats(profile.preferredResponses);
  }

  return builder.build();
}

/**
 * 콘텐츠에 UDL 옵션 적용
 */
export function applyUDLToContent<T extends { accessibility?: UDLAccessibility }>(
  content: T,
  udlSettings: UDLAccessibility
): T {
  return {
    ...content,
    accessibility: udlSettings
  };
}

/**
 * 접근성 점검표 생성
 */
export function generateAccessibilityChecklist(settings: UDLAccessibility): {
  category: string;
  item: string;
  status: 'pass' | 'warning' | 'fail';
  recommendation?: string;
}[] {
  const checklist: {
    category: string;
    item: string;
    status: 'pass' | 'warning' | 'fail';
    recommendation?: string;
  }[] = [];

  // 표현 방식 점검
  checklist.push({
    category: '표현 방식',
    item: '텍스트 음성 변환',
    status: settings.representation.textToSpeech ? 'pass' : 'warning',
    recommendation: !settings.representation.textToSpeech
      ? '읽기에 어려움이 있는 학생을 위해 TTS를 활성화하세요.'
      : undefined
  });

  checklist.push({
    category: '표현 방식',
    item: '시각적 보조',
    status: settings.representation.visualSupports ? 'pass' : 'warning',
    recommendation: !settings.representation.visualSupports
      ? '이해를 돕기 위해 시각적 보조를 추가하세요.'
      : undefined
  });

  checklist.push({
    category: '표현 방식',
    item: '다중 형식 제공',
    status: settings.representation.multipleFormats.length >= 3 ? 'pass' : 'warning',
    recommendation: settings.representation.multipleFormats.length < 3
      ? '최소 3가지 이상의 형식을 제공하세요.'
      : undefined
  });

  // 행동/표현 방식 점검
  checklist.push({
    category: '행동/표현',
    item: '다중 입력 방식',
    status: settings.action.inputMethods.length >= 2 ? 'pass' : 'warning',
    recommendation: settings.action.inputMethods.length < 2
      ? '터치와 음성 등 다양한 입력 방식을 지원하세요.'
      : undefined
  });

  checklist.push({
    category: '행동/표현',
    item: '시간 제한',
    status: settings.action.timingOptions?.unlimitedTime ? 'pass' : 'warning',
    recommendation: !settings.action.timingOptions?.unlimitedTime
      ? '초등 1학년은 무제한 시간을 권장합니다.'
      : undefined
  });

  // 참여 방식 점검
  checklist.push({
    category: '참여 방식',
    item: '자기 속도 학습',
    status: settings.engagement.selfPacedLearning ? 'pass' : 'fail',
    recommendation: !settings.engagement.selfPacedLearning
      ? '자기 속도에 맞춘 학습은 필수입니다.'
      : undefined
  });

  checklist.push({
    category: '참여 방식',
    item: '선택권 제공',
    status: settings.engagement.choiceOptions ? 'pass' : 'warning',
    recommendation: !settings.engagement.choiceOptions
      ? '학생에게 선택권을 제공하면 동기가 향상됩니다.'
      : undefined
  });

  // 화면 표시 점검
  checklist.push({
    category: '화면 표시',
    item: '글자 크기',
    status:
      settings.display.fontSize === 'large' || settings.display.fontSize === 'extra-large'
        ? 'pass'
        : 'warning',
    recommendation:
      settings.display.fontSize !== 'large' && settings.display.fontSize !== 'extra-large'
        ? '초등 1학년은 큰 글자를 권장합니다.'
        : undefined
  });

  checklist.push({
    category: '화면 표시',
    item: '줄 간격',
    status: settings.display.lineSpacing >= 1.5 ? 'pass' : 'warning',
    recommendation: settings.display.lineSpacing < 1.5
      ? '가독성을 위해 줄 간격을 1.5 이상으로 설정하세요.'
      : undefined
  });

  return checklist;
}

/**
 * UDL 점수 계산
 */
export function calculateUDLScore(settings: UDLAccessibility): {
  overall: number;
  representation: number;
  action: number;
  engagement: number;
} {
  // 표현 방식 점수 (0-100)
  let representationScore = 0;
  if (settings.representation.textToSpeech) representationScore += 25;
  if (settings.representation.visualSupports) representationScore += 25;
  if (settings.representation.simplifiedLanguage) representationScore += 25;
  representationScore += Math.min(25, settings.representation.multipleFormats.length * 6);

  // 행동/표현 점수 (0-100)
  let actionScore = 0;
  actionScore += Math.min(40, settings.action.inputMethods.length * 20);
  actionScore += Math.min(40, settings.action.responseFormats?.length || 0 * 20);
  if (settings.action.timingOptions?.unlimitedTime) actionScore += 20;

  // 참여 방식 점수 (0-100)
  let engagementScore = 0;
  if (settings.engagement.selfPacedLearning) engagementScore += 30;
  if (settings.engagement.choiceOptions) engagementScore += 25;
  if (settings.engagement.selfRegulationSupport?.progressVisualization) engagementScore += 25;
  if (settings.engagement.interestBasedOptions?.themeSelection) engagementScore += 20;

  // 전체 점수 (가중 평균)
  const overall = Math.round(
    (representationScore * 0.4 + actionScore * 0.3 + engagementScore * 0.3)
  );

  return {
    overall,
    representation: representationScore,
    action: actionScore,
    engagement: engagementScore
  };
}

/**
 * UDL 권장 사항 생성
 */
export function generateUDLRecommendations(
  settings: UDLAccessibility
): { priority: 'high' | 'medium' | 'low'; recommendation: string }[] {
  const recommendations: { priority: 'high' | 'medium' | 'low'; recommendation: string }[] = [];

  // 높은 우선순위 권장 사항
  if (!settings.representation.textToSpeech) {
    recommendations.push({
      priority: 'high',
      recommendation: '텍스트 음성 변환(TTS)을 활성화하세요. 초등 1학년은 읽기 발달 단계이므로 필수입니다.'
    });
  }

  if (!settings.engagement.selfPacedLearning) {
    recommendations.push({
      priority: 'high',
      recommendation: '자기 속도 학습을 활성화하세요. 학생마다 학습 속도가 다릅니다.'
    });
  }

  // 중간 우선순위 권장 사항
  if (settings.action.inputMethods.length < 2) {
    recommendations.push({
      priority: 'medium',
      recommendation: '터치와 음성 등 2가지 이상의 입력 방식을 지원하세요.'
    });
  }

  if (settings.display.fontSize !== 'large' && settings.display.fontSize !== 'extra-large') {
    recommendations.push({
      priority: 'medium',
      recommendation: '글자 크기를 "large" 이상으로 설정하세요.'
    });
  }

  // 낮은 우선순위 권장 사항
  if (!settings.engagement.interestBasedOptions?.themeSelection) {
    recommendations.push({
      priority: 'low',
      recommendation: '테마 선택 옵션을 추가하면 학생의 흥미를 높일 수 있습니다.'
    });
  }

  if (!settings.action.timingOptions?.breakReminders) {
    recommendations.push({
      priority: 'low',
      recommendation: '쉬는 시간 알림을 추가하면 집중력 유지에 도움이 됩니다.'
    });
  }

  return recommendations;
}

/**
 * 콘텐츠 유형별 UDL 조정
 */
export function adjustUDLForContentType(
  baseSettings: UDLAccessibility,
  contentType: string
): UDLAccessibility {
  const builder = new UDLBuilder();
  Object.assign(builder, { settings: { ...baseSettings } });

  switch (contentType) {
    case 'reading':
      builder.enableTextToSpeech('slow');
      builder.setRepresentation({
        ...baseSettings.representation,
        vocabularySupport: {
          highlightDifficultWords: true,
          definitionPopup: true,
          pictureDictionary: true
        }
      });
      break;

    case 'writing':
      builder.setInputMethods(['touch', 'voice']);
      builder.setAction({
        ...baseSettings.action,
        assistiveTools: {
          ...baseSettings.action.assistiveTools,
          handwritingRecognition: true
        }
      });
      break;

    case 'math':
      builder.setRepresentation({
        ...baseSettings.representation,
        visualSupports: true,
        multipleFormats: ['image', 'animation', 'text', 'audio']
      });
      break;

    case 'game':
      builder.setEngagement({
        ...baseSettings.engagement,
        interestBasedOptions: {
          themeSelection: true,
          characterSelection: true,
          rewardSelection: true
        }
      });
      break;

    case 'assessment':
      builder.enableSelfPacedLearning();
      builder.setAction({
        ...baseSettings.action,
        timingOptions: {
          ...baseSettings.action.timingOptions,
          unlimitedTime: true,
          extraTimeMultiplier: 1.5
        }
      });
      break;
  }

  return builder.build();
}
