/**
 * 디지털 리터러시 콘텐츠 생성기
 * 초등 1학년 디지털 기초 소양 학습 콘텐츠 생성
 */

import { BaseContentGenerator } from './base-generator';
import {
  Subject,
  ContentGenerationRequest,
  ContentGenerationResponse,
  ContentElement,
  InteractionElement,
  AchievementStandardReference,
  BloomLevel
} from '../types';

/** 디지털 리터러시 콘텐츠 유형 */
type DigitalLiteracyCategory =
  | 'device_basics'       // 기기 기초
  | 'app_navigation'      // 앱 탐색
  | 'digital_safety'      // 디지털 안전
  | 'digital_citizenship' // 디지털 시민성
  | 'creative_tools'      // 창작 도구
  | 'information_search'; // 정보 검색

/** 기기 아이콘/요소 */
const DEVICE_ELEMENTS = {
  tablet: ['전원 버튼', '홈 버튼', '볼륨 버튼', '화면', '카메라'],
  app: ['앱 아이콘', '뒤로 가기', '홈으로 가기', '설정', '닫기 버튼']
};

/**
 * 디지털 리터러시 콘텐츠 생성기
 */
export class DigitalLiteracyContentGenerator extends BaseContentGenerator {
  protected subject: Subject = 'digital_literacy';

  /**
   * 콘텐츠 생성
   */
  async generate(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    const startTime = Date.now();

    try {
      // 성취 기준 생성 (디지털 리터러시는 별도 성취 기준 필요)
      const achievementStandard = this.createDigitalLiteracyStandard(request.achievementStandardCode);

      // 콘텐츠 카테고리 결정
      const category = this.determineContentCategory(request.achievementStandardCode);

      // 카테고리별 콘텐츠 생성
      let elements: ContentElement[] = [];
      let interactions: InteractionElement[] = [];

      switch (category) {
        case 'device_basics':
          ({ elements, interactions } = this.generateDeviceBasicsContent(request));
          break;
        case 'app_navigation':
          ({ elements, interactions } = this.generateAppNavigationContent(request));
          break;
        case 'digital_safety':
          ({ elements, interactions } = this.generateDigitalSafetyContent(request));
          break;
        case 'digital_citizenship':
          ({ elements, interactions } = this.generateDigitalCitizenshipContent(request));
          break;
        case 'creative_tools':
          ({ elements, interactions } = this.generateCreativeToolsContent(request));
          break;
        case 'information_search':
          ({ elements, interactions } = this.generateInformationSearchContent(request));
          break;
        default:
          ({ elements, interactions } = this.generateDeviceBasicsContent(request));
      }

      // Bloom 수준 설정
      const bloomLevel = this.createBloomTaxonomy(
        (request.targetBloomLevel as BloomLevel) || 'apply'
      );

      // ARCS 동기 요소 생성
      const arcsElements = this.createARCSMotivation(request.theme);

      // 콘텐츠 본문 생성
      const contentBody = this.createContentBody(
        request.contentType,
        elements,
        interactions,
        request.estimatedDuration
      );

      // 최종 콘텐츠 조립
      const content = this.assembleLearningContent(
        this.generateTitle(category, request.theme),
        achievementStandard,
        bloomLevel,
        arcsElements,
        contentBody,
        this.createGradeLevel(1, '디지털 기초'),
        this.getDefaultUDLSettings(request.accessibilityPreset),
        ['디지털', '1학년', category]
      );

      const processingTime = Date.now() - startTime;
      return this.createSuccessResponse(content, processingTime);
    } catch (error) {
      return this.createErrorResponse(`콘텐츠 생성 실패: ${error}`);
    }
  }

  /**
   * 디지털 리터러시 성취 기준 생성
   */
  private createDigitalLiteracyStandard(code: string): AchievementStandardReference {
    const standards: Record<string, AchievementStandardReference> = {
      '[1디지털01-01]': {
        code: '[1디지털01-01]',
        description: '디지털 기기의 기본 사용 방법을 알고 안전하게 사용한다.',
        learningObjectives: [
          '태블릿/컴퓨터의 전원을 켜고 끌 수 있다.',
          '화면을 터치하여 원하는 앱을 실행할 수 있다.',
          '기기를 소중히 다루는 방법을 안다.'
        ],
        assessmentCriteria: [
          { level: 'excellent', description: '기기를 능숙하게 조작하고 안전 수칙을 스스로 지킨다.' },
          { level: 'good', description: '기기의 기본 조작이 가능하고 안전 수칙을 안다.' },
          { level: 'needs_improvement', description: '기기 사용에 도움이 필요하다.' }
        ]
      },
      '[1디지털01-02]': {
        code: '[1디지털01-02]',
        description: '학습 앱을 탐색하고 활용할 수 있다.',
        learningObjectives: [
          '앱의 버튼과 아이콘을 이해하고 사용할 수 있다.',
          '앱에서 원하는 기능을 찾을 수 있다.',
          '앱을 종료하고 다른 앱으로 이동할 수 있다.'
        ]
      },
      '[1디지털02-01]': {
        code: '[1디지털02-01]',
        description: '디지털 세계에서 안전하게 행동하는 방법을 안다.',
        learningObjectives: [
          '개인 정보를 지키는 방법을 안다.',
          '낯선 사람의 요청에 응하지 않는다.',
          '이상한 것을 발견하면 어른에게 알린다.'
        ]
      },
      '[1디지털02-02]': {
        code: '[1디지털02-02]',
        description: '디지털 공간에서 예의 바르게 행동한다.',
        learningObjectives: [
          '온라인에서도 친구에게 친절하게 대한다.',
          '다른 사람의 작품을 존중한다.',
          '바른 말을 사용한다.'
        ]
      },
      '[1디지털03-01]': {
        code: '[1디지털03-01]',
        description: '디지털 도구를 활용하여 간단한 창작물을 만든다.',
        learningObjectives: [
          '그림 그리기 앱을 사용할 수 있다.',
          '사진을 찍고 꾸밀 수 있다.',
          '간단한 애니메이션이나 스티커를 만들 수 있다.'
        ]
      }
    };

    return standards[code] || {
      code: code,
      description: '디지털 기초 소양 활동',
      learningObjectives: ['디지털 기초 능력을 기른다.']
    };
  }

  /**
   * 콘텐츠 카테고리 결정
   */
  private determineContentCategory(code: string): DigitalLiteracyCategory {
    if (code.includes('01-01')) return 'device_basics';
    if (code.includes('01-02')) return 'app_navigation';
    if (code.includes('02-01')) return 'digital_safety';
    if (code.includes('02-02')) return 'digital_citizenship';
    if (code.includes('03-01')) return 'creative_tools';
    return 'device_basics';
  }

  /**
   * 제목 생성
   */
  private generateTitle(category: DigitalLiteracyCategory, theme?: string): string {
    const titles: Record<DigitalLiteracyCategory, string[]> = {
      device_basics: ['태블릿 친구와 만나요', '기기야 안녕!', '버튼을 눌러보자'],
      app_navigation: ['앱 탐험대', '버튼 찾기 모험', '앱 속으로 출발!'],
      digital_safety: ['안전한 디지털 세상', '비밀을 지켜요', '디지털 안전 히어로'],
      digital_citizenship: ['디지털 예절 배우기', '친절한 온라인 친구', '바른 디지털 습관'],
      creative_tools: ['디지털 화가', '나만의 작품 만들기', '창작 놀이터'],
      information_search: ['정보를 찾아요', '검색 모험', '궁금한 것 찾기']
    };
    const categoryTitles = titles[category];
    const baseTitle = categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
    return theme ? `${baseTitle} - ${theme}` : baseTitle;
  }

  /**
   * 기기 기초 콘텐츠 생성
   */
  private generateDeviceBasicsContent(request: ContentGenerationRequest): {
    elements: ContentElement[];
    interactions: InteractionElement[];
  } {
    const elements: ContentElement[] = [];
    const interactions: InteractionElement[] = [];

    // 소개 캐릭터 대화
    elements.push(
      this.createContentElement(
        'character_dialogue',
        {
          character: {
            name: '디지털 요정 디디',
            emotion: 'happy',
            dialogue: '안녕! 오늘은 태블릿을 사용하는 방법을 배워볼 거야!'
          }
        },
        0
      )
    );

    // 기기 이미지
    elements.push(
      this.createContentElement(
        'image',
        {
          text: '이것은 태블릿이에요. 화면을 터치해서 사용해요!',
          imageUrl: '/images/digital/tablet_intro.png',
          altText: '태블릿 소개 이미지'
        },
        1
      )
    );

    // 버튼 설명
    const deviceElement = DEVICE_ELEMENTS.tablet[Math.floor(Math.random() * DEVICE_ELEMENTS.tablet.length)];
    elements.push(
      this.createContentElement(
        'text',
        {
          text: `"${deviceElement}"을/를 찾아볼까요?`,
          audioUrl: '/audio/digital/find_button.mp3'
        },
        2
      )
    );

    // 버튼 찾기 상호작용
    const options = DEVICE_ELEMENTS.tablet.slice(0, 4).map((el, i) => ({
      id: `btn-${i}`,
      content: el,
      imageUrl: `/images/digital/button_${i}.png`,
      isCorrect: el === deviceElement
    }));

    interactions.push(
      this.createInteractionElement(
        'tap_select',
        `"${deviceElement}"을/를 찾아서 눌러 보세요!`,
        options
      )
    );

    // 안전 사용 팁
    elements.push(
      this.createContentElement(
        'character_dialogue',
        {
          character: {
            name: '디지털 요정 디디',
            emotion: 'encouraging',
            dialogue: '태블릿은 소중히 다뤄야 해요. 떨어뜨리지 않게 조심!'
          }
        },
        3
      )
    );

    return { elements, interactions };
  }

  /**
   * 앱 탐색 콘텐츠 생성
   */
  private generateAppNavigationContent(request: ContentGenerationRequest): {
    elements: ContentElement[];
    interactions: InteractionElement[];
  } {
    const elements: ContentElement[] = [];
    const interactions: InteractionElement[] = [];

    elements.push(
      this.createContentElement(
        'character_dialogue',
        {
          character: {
            name: '디지털 요정 디디',
            emotion: 'curious',
            dialogue: '앱 안에서 버튼을 찾아볼까요?'
          }
        },
        0
      )
    );

    // 앱 화면 소개
    elements.push(
      this.createContentElement(
        'image',
        {
          text: '앱 화면을 살펴봐요!',
          imageUrl: '/images/digital/app_screen.png',
          altText: '앱 화면 예시'
        },
        1
      )
    );

    // 버튼 기능 설명
    const appElement = DEVICE_ELEMENTS.app[Math.floor(Math.random() * DEVICE_ELEMENTS.app.length)];
    elements.push(
      this.createContentElement(
        'text',
        {
          text: `"${appElement}"은/는 무엇을 하는 버튼일까요?`,
          audioUrl: '/audio/digital/button_function.mp3'
        },
        2
      )
    );

    // 버튼 찾기
    const options = DEVICE_ELEMENTS.app.slice(0, 4).map((el, i) => ({
      id: `app-${i}`,
      content: el,
      isCorrect: el === appElement
    }));

    interactions.push(
      this.createInteractionElement(
        'tap_select',
        `"${appElement}"을/를 찾아보세요!`,
        options
      )
    );

    // 드래그하여 앱 이동
    interactions.push(
      this.createInteractionElement(
        'drag_drop',
        '앱 아이콘을 드래그해서 원하는 곳으로 옮겨보세요!'
      )
    );

    return { elements, interactions };
  }

  /**
   * 디지털 안전 콘텐츠 생성
   */
  private generateDigitalSafetyContent(request: ContentGenerationRequest): {
    elements: ContentElement[];
    interactions: InteractionElement[];
  } {
    const elements: ContentElement[] = [];
    const interactions: InteractionElement[] = [];

    elements.push(
      this.createContentElement(
        'character_dialogue',
        {
          character: {
            name: '디지털 요정 디디',
            emotion: 'encouraging',
            dialogue: '디지털 세상에서 안전하게 지내는 방법을 알아볼까요?'
          }
        },
        0
      )
    );

    // 안전 수칙 소개
    const safetyRules = [
      { rule: '비밀번호는 나만 알아요', icon: 'lock' },
      { rule: '모르는 사람에게 답하지 않아요', icon: 'stranger' },
      { rule: '이상한 것은 어른에게 알려요', icon: 'adult' },
      { rule: '개인 정보를 알려주지 않아요', icon: 'info' }
    ];

    const selectedRule = safetyRules[Math.floor(Math.random() * safetyRules.length)];

    elements.push(
      this.createContentElement(
        'image',
        {
          text: selectedRule.rule,
          imageUrl: `/images/digital/safety_${selectedRule.icon}.png`,
          altText: selectedRule.rule
        },
        1
      )
    );

    // 상황 판단 문제
    elements.push(
      this.createContentElement(
        'text',
        {
          text: '다음 상황에서 어떻게 해야 할까요?'
        },
        2
      )
    );

    // 시나리오
    elements.push(
      this.createContentElement(
        'text',
        {
          text: '모르는 사람이 "이름이 뭐니?"라고 물어봤어요.',
          audioUrl: '/audio/digital/scenario1.mp3'
        },
        3
      )
    );

    // 선택지
    const options = [
      { id: 'opt-1', content: '대답하지 않고 어른에게 알려요', isCorrect: true },
      { id: 'opt-2', content: '친절하게 이름을 알려줘요', isCorrect: false },
      { id: 'opt-3', content: '가짜 이름을 말해요', isCorrect: false }
    ];

    interactions.push(
      this.createInteractionElement(
        'tap_select',
        '안전한 행동을 골라보세요!',
        options
      )
    );

    return { elements, interactions };
  }

  /**
   * 디지털 시민성 콘텐츠 생성
   */
  private generateDigitalCitizenshipContent(request: ContentGenerationRequest): {
    elements: ContentElement[];
    interactions: InteractionElement[];
  } {
    const elements: ContentElement[] = [];
    const interactions: InteractionElement[] = [];

    elements.push(
      this.createContentElement(
        'character_dialogue',
        {
          character: {
            name: '디지털 요정 디디',
            emotion: 'happy',
            dialogue: '온라인에서도 예의 바르게 행동해야 해요!'
          }
        },
        0
      )
    );

    // 디지털 예절 소개
    const manners = [
      '친구에게 친절한 말을 해요',
      '다른 사람의 작품을 존중해요',
      '고운 말을 사용해요',
      '차례를 기다려요'
    ];

    const selectedManner = manners[Math.floor(Math.random() * manners.length)];

    elements.push(
      this.createContentElement(
        'image',
        {
          text: selectedManner,
          imageUrl: '/images/digital/manner.png',
          altText: '디지털 예절 이미지'
        },
        1
      )
    );

    // OX 퀴즈
    elements.push(
      this.createContentElement(
        'text',
        {
          text: '다음 행동이 바른 행동인지 생각해 보세요!'
        },
        2
      )
    );

    // 시나리오
    elements.push(
      this.createContentElement(
        'text',
        {
          text: '"친구의 그림이 마음에 안 들어서 나쁜 말을 했어요."',
          audioUrl: '/audio/digital/scenario_manner.mp3'
        },
        3
      )
    );

    const options = [
      { id: 'o', content: 'O (바른 행동)', isCorrect: false },
      { id: 'x', content: 'X (바르지 않은 행동)', isCorrect: true }
    ];

    interactions.push(
      this.createInteractionElement(
        'tap_select',
        '바른 행동일까요?',
        options
      )
    );

    return { elements, interactions };
  }

  /**
   * 창작 도구 콘텐츠 생성
   */
  private generateCreativeToolsContent(request: ContentGenerationRequest): {
    elements: ContentElement[];
    interactions: InteractionElement[];
  } {
    const elements: ContentElement[] = [];
    const interactions: InteractionElement[] = [];

    elements.push(
      this.createContentElement(
        'character_dialogue',
        {
          character: {
            name: '디지털 요정 디디',
            emotion: 'celebrating',
            dialogue: '디지털 도구로 멋진 그림을 그려볼까요?'
          }
        },
        0
      )
    );

    // 도구 소개
    elements.push(
      this.createContentElement(
        'image',
        {
          text: '여러 가지 그리기 도구가 있어요!',
          imageUrl: '/images/digital/drawing_tools.png',
          altText: '그리기 도구들'
        },
        1
      )
    );

    // 도구 설명
    const tools = [
      { name: '연필', use: '가는 선을 그려요' },
      { name: '붓', use: '두꺼운 선을 그려요' },
      { name: '지우개', use: '그린 것을 지워요' },
      { name: '색 선택', use: '원하는 색을 골라요' }
    ];

    const selectedTool = tools[Math.floor(Math.random() * tools.length)];

    elements.push(
      this.createContentElement(
        'text',
        {
          text: `"${selectedTool.name}"은/는 ${selectedTool.use}`,
          audioUrl: `/audio/digital/tool_${selectedTool.name}.mp3`
        },
        2
      )
    );

    // 도구 선택하기
    const options = tools.map((t, i) => ({
      id: `tool-${i}`,
      content: t.name,
      imageUrl: `/images/digital/tool_${i}.png`,
      isCorrect: t.name === selectedTool.name
    }));

    interactions.push(
      this.createInteractionElement(
        'tap_select',
        `"${selectedTool.name}"을/를 찾아보세요!`,
        options
      )
    );

    // 그리기 활동
    interactions.push(
      this.createInteractionElement(
        'draw',
        '자유롭게 그림을 그려보세요!'
      )
    );

    return { elements, interactions };
  }

  /**
   * 정보 검색 콘텐츠 생성
   */
  private generateInformationSearchContent(request: ContentGenerationRequest): {
    elements: ContentElement[];
    interactions: InteractionElement[];
  } {
    const elements: ContentElement[] = [];
    const interactions: InteractionElement[] = [];

    elements.push(
      this.createContentElement(
        'character_dialogue',
        {
          character: {
            name: '디지털 요정 디디',
            emotion: 'curious',
            dialogue: '궁금한 것을 찾아볼까요?'
          }
        },
        0
      )
    );

    // 검색 방법 소개
    elements.push(
      this.createContentElement(
        'image',
        {
          text: '검색 창에 궁금한 것을 입력해요!',
          imageUrl: '/images/digital/search_bar.png',
          altText: '검색 창 이미지'
        },
        1
      )
    );

    // 검색 예시
    const searchTopics = ['강아지', '공룡', '우주', '꽃'];
    const topic = searchTopics[Math.floor(Math.random() * searchTopics.length)];

    elements.push(
      this.createContentElement(
        'text',
        {
          text: `"${topic}"에 대해 찾아볼까요?`,
          audioUrl: `/audio/digital/search_${topic}.mp3`
        },
        2
      )
    );

    // 검색어 입력 (음성 또는 터치)
    interactions.push(
      this.createInteractionElement(
        'voice_input',
        `"${topic}"이라고 말해보세요!`
      )
    );

    return { elements, interactions };
  }
}
