/**
 * UDL (Universal Design for Learning) - 보편적 학습 설계
 * 초등 1학년 접근성 및 다양성 지원 설정
 */

import { FontSize, ColorBlindMode, InputMethod, ResponseFormat } from './common';

// ============================================
// UDL 기본 원리
// ============================================

/**
 * UDL 3가지 핵심 원리
 * 1. 다양한 표현 방식 (Representation) - "What" of learning
 * 2. 다양한 행동과 표현 (Action & Expression) - "How" of learning
 * 3. 다양한 참여 방식 (Engagement) - "Why" of learning
 */

/** UDL 원리 유형 */
export type UDLPrinciple = 'representation' | 'action' | 'engagement';

// ============================================
// 표현 방식 (Representation)
// ============================================

/** 다양한 표현 방식 설정 */
export interface RepresentationOptions {
  /** 텍스트 음성 변환 (TTS) */
  textToSpeech: boolean;
  /** 시각적 보조 (아이콘, 그림, 애니메이션) */
  visualSupports: boolean;
  /** 쉬운 언어 사용 */
  simplifiedLanguage: boolean;
  /** 제공 형식 */
  multipleFormats: Array<'text' | 'audio' | 'image' | 'video' | 'animation'>;
  /** 언어 설정 */
  languageOptions?: LanguageSupport;
  /** 어휘 지원 */
  vocabularySupport?: VocabularySupport;
}

/** 언어 지원 설정 */
export interface LanguageSupport {
  /** 기본 언어 */
  primaryLanguage: 'ko';
  /** 음성 속도 조절 */
  speechRate: 'slow' | 'normal' | 'fast';
  /** 반복 재생 가능 */
  repeatEnabled: boolean;
  /** 음절 단위 읽기 */
  syllableHighlight: boolean;
}

/** 어휘 지원 설정 */
export interface VocabularySupport {
  /** 어려운 단어 표시 */
  highlightDifficultWords: boolean;
  /** 단어 뜻 팝업 */
  definitionPopup: boolean;
  /** 그림 사전 연결 */
  pictureDictionary: boolean;
}

// ============================================
// 행동과 표현 (Action & Expression)
// ============================================

/** 다양한 행동/표현 방식 설정 */
export interface ActionOptions {
  /** 입력 방식 */
  inputMethods: InputMethod[];
  /** 응답 형식 */
  responseFormats: ResponseFormat[];
  /** 보조 도구 */
  assistiveTools?: AssistiveTools;
  /** 시간 설정 */
  timingOptions?: TimingOptions;
}

/** 보조 도구 설정 */
export interface AssistiveTools {
  /** 손글씨 인식 */
  handwritingRecognition?: boolean;
  /** 음성 인식 */
  voiceRecognition?: boolean;
  /** 자동 완성 */
  autoComplete?: boolean;
  /** 예측 텍스트 */
  predictiveText?: boolean;
  /** 화면 확대 */
  screenMagnification?: boolean;
}

/** 시간 설정 */
export interface TimingOptions {
  /** 시간 제한 해제 가능 */
  unlimitedTime?: boolean;
  /** 추가 시간 비율 (1.0 = 기본, 1.5 = 50% 추가) */
  extraTimeMultiplier?: number;
  /** 자동 일시정지 */
  autoPause?: boolean;
  /** 쉬는 시간 알림 */
  breakReminders?: boolean;
  /** 쉬는 시간 간격(분) */
  breakInterval?: number;
}

// ============================================
// 참여 방식 (Engagement)
// ============================================

/** 다양한 참여 방식 설정 */
export interface EngagementOptions {
  /** 선택권 제공 */
  choiceOptions: boolean;
  /** 자기 속도 학습 */
  selfPacedLearning: boolean;
  /** 협동 학습 옵션 */
  collaborativeOption: boolean;
  /** 흥미 기반 옵션 */
  interestBasedOptions?: InterestOptions;
  /** 자기 조절 지원 */
  selfRegulationSupport?: SelfRegulationSupport;
}

/** 흥미 기반 옵션 */
export interface InterestOptions {
  /** 테마 선택 가능 */
  themeSelection: boolean;
  /** 사용 가능한 테마 */
  availableThemes?: string[];
  /** 캐릭터 선택 가능 */
  characterSelection: boolean;
  /** 보상 선택 가능 */
  rewardSelection: boolean;
}

/** 자기 조절 지원 */
export interface SelfRegulationSupport {
  /** 목표 설정 기능 */
  goalSetting: boolean;
  /** 진행 상황 시각화 */
  progressVisualization: boolean;
  /** 자기 평가 체크리스트 */
  selfAssessmentChecklist: boolean;
  /** 감정 체크인 */
  emotionCheckIn: boolean;
}

// ============================================
// 화면 표시 설정 (Display)
// ============================================

/** 화면 표시 설정 */
export interface DisplayOptions {
  /** 글자 크기 */
  fontSize: FontSize;
  /** 글꼴 */
  fontFamily: string;
  /** 줄 간격 */
  lineSpacing: number;
  /** 고대비 모드 */
  highContrast: boolean;
  /** 색맹 지원 모드 */
  colorBlindMode: ColorBlindMode;
  /** 다크 모드 */
  darkMode?: boolean;
  /** 화면 방향 고정 */
  orientationLock?: 'portrait' | 'landscape' | 'none';
  /** 애니메이션 감소 */
  reduceMotion?: boolean;
}

// ============================================
// 전체 UDL 설정
// ============================================

/** UDL 접근성 전체 설정 */
export interface UDLAccessibility {
  /** 다양한 표현 방식 */
  representation: RepresentationOptions;
  /** 다양한 참여 방식 */
  engagement: EngagementOptions;
  /** 다양한 행동과 표현 방식 */
  action: ActionOptions;
  /** 화면 표시 설정 */
  display: DisplayOptions;
}

// ============================================
// 초등 1학년 기본 UDL 프리셋
// ============================================

/** 초등 1학년 기본 UDL 설정 */
export const Grade1DefaultUDLSettings: UDLAccessibility = {
  representation: {
    textToSpeech: true,
    visualSupports: true,
    simplifiedLanguage: true,
    multipleFormats: ['text', 'audio', 'image', 'animation'],
    languageOptions: {
      primaryLanguage: 'ko',
      speechRate: 'slow',
      repeatEnabled: true,
      syllableHighlight: true
    },
    vocabularySupport: {
      highlightDifficultWords: true,
      definitionPopup: true,
      pictureDictionary: true
    }
  },
  engagement: {
    choiceOptions: true,
    selfPacedLearning: true,
    collaborativeOption: false,
    interestBasedOptions: {
      themeSelection: true,
      availableThemes: ['동물', '자연', '우주', '바다', '숲'],
      characterSelection: true,
      rewardSelection: true
    },
    selfRegulationSupport: {
      goalSetting: false,
      progressVisualization: true,
      selfAssessmentChecklist: false,
      emotionCheckIn: true
    }
  },
  action: {
    inputMethods: ['touch', 'voice'],
    responseFormats: ['select', 'draw', 'speak'],
    assistiveTools: {
      handwritingRecognition: true,
      voiceRecognition: true,
      autoComplete: false,
      predictiveText: false,
      screenMagnification: true
    },
    timingOptions: {
      unlimitedTime: true,
      extraTimeMultiplier: 1.0,
      autoPause: true,
      breakReminders: true,
      breakInterval: 15
    }
  },
  display: {
    fontSize: 'large',
    fontFamily: '나눔바른고딕',
    lineSpacing: 1.8,
    highContrast: false,
    colorBlindMode: 'none',
    darkMode: false,
    orientationLock: 'none',
    reduceMotion: false
  }
};

/** 저시력 학생용 UDL 프리셋 */
export const LowVisionUDLSettings: Partial<UDLAccessibility> = {
  display: {
    fontSize: 'extra-large',
    fontFamily: '나눔바른고딕',
    lineSpacing: 2.0,
    highContrast: true,
    colorBlindMode: 'none',
    darkMode: false,
    orientationLock: 'none',
    reduceMotion: false
  },
  action: {
    inputMethods: ['touch', 'voice'],
    responseFormats: ['speak', 'select'],
    assistiveTools: {
      handwritingRecognition: false,
      voiceRecognition: true,
      autoComplete: false,
      predictiveText: false,
      screenMagnification: true
    },
    timingOptions: {
      unlimitedTime: true,
      extraTimeMultiplier: 2.0,
      autoPause: true,
      breakReminders: true,
      breakInterval: 10
    }
  }
};

/** 난독증 학생용 UDL 프리셋 */
export const DyslexiaUDLSettings: Partial<UDLAccessibility> = {
  representation: {
    textToSpeech: true,
    visualSupports: true,
    simplifiedLanguage: true,
    multipleFormats: ['audio', 'image', 'animation', 'text'],
    languageOptions: {
      primaryLanguage: 'ko',
      speechRate: 'slow',
      repeatEnabled: true,
      syllableHighlight: true
    },
    vocabularySupport: {
      highlightDifficultWords: true,
      definitionPopup: true,
      pictureDictionary: true
    }
  },
  display: {
    fontSize: 'large',
    fontFamily: '나눔바른고딕',
    lineSpacing: 2.2,
    highContrast: false,
    colorBlindMode: 'none',
    darkMode: false,
    orientationLock: 'none',
    reduceMotion: false
  }
};

/** ADHD 학생용 UDL 프리셋 */
export const ADHDUDLSettings: Partial<UDLAccessibility> = {
  engagement: {
    choiceOptions: true,
    selfPacedLearning: true,
    collaborativeOption: false,
    selfRegulationSupport: {
      goalSetting: true,
      progressVisualization: true,
      selfAssessmentChecklist: true,
      emotionCheckIn: true
    }
  },
  action: {
    inputMethods: ['touch', 'voice'],
    responseFormats: ['select', 'speak'],
    assistiveTools: {
      handwritingRecognition: true,
      voiceRecognition: true,
      autoComplete: false,
      predictiveText: false,
      screenMagnification: false
    },
    timingOptions: {
      unlimitedTime: false,
      extraTimeMultiplier: 1.5,
      autoPause: false,
      breakReminders: true,
      breakInterval: 10
    }
  },
  display: {
    fontSize: 'large',
    fontFamily: '나눔바른고딕',
    lineSpacing: 1.8,
    highContrast: false,
    colorBlindMode: 'none',
    darkMode: false,
    orientationLock: 'none',
    reduceMotion: true
  }
};
