/**
 * 수학 콘텐츠 생성기
 * 초등 1학년 수학 학습 콘텐츠 생성
 */

import { BaseContentGenerator } from './base-generator';
import {
  Subject,
  ContentGenerationRequest,
  ContentGenerationResponse,
  ContentElement,
  InteractionElement,
  AchievementStandardReference,
  BloomLevel,
  MathGrade1Standards
} from '../types';

/** 수학 콘텐츠 유형 */
type MathContentCategory =
  | 'counting'        // 수 세기
  | 'number_recognition' // 숫자 인식
  | 'addition'        // 덧셈
  | 'subtraction'     // 뺄셈
  | 'comparison'      // 비교
  | 'shapes'          // 도형
  | 'measurement'     // 측정
  | 'patterns';       // 패턴

/** 수 세기 이미지 */
const COUNTING_ITEMS = ['사과', '별', '하트', '공', '꽃', '나비', '자동차', '연필'];

/**
 * 수학 콘텐츠 생성기
 */
export class MathContentGenerator extends BaseContentGenerator {
  protected subject: Subject = 'math';

  /**
   * 콘텐츠 생성
   */
  async generate(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    const startTime = Date.now();

    try {
      // 성취 기준 조회
      const achievementStandard = this.findAchievementStandard(request.achievementStandardCode);
      if (!achievementStandard) {
        return this.createErrorResponse(`성취 기준을 찾을 수 없습니다: ${request.achievementStandardCode}`);
      }

      // 콘텐츠 카테고리 결정
      const category = this.determineContentCategory(request.achievementStandardCode);

      // 카테고리별 콘텐츠 생성
      let elements: ContentElement[] = [];
      let interactions: InteractionElement[] = [];

      switch (category) {
        case 'counting':
          ({ elements, interactions } = this.generateCountingContent(request));
          break;
        case 'number_recognition':
          ({ elements, interactions } = this.generateNumberRecognitionContent(request));
          break;
        case 'addition':
          ({ elements, interactions } = this.generateAdditionContent(request));
          break;
        case 'subtraction':
          ({ elements, interactions } = this.generateSubtractionContent(request));
          break;
        case 'comparison':
          ({ elements, interactions } = this.generateComparisonContent(request));
          break;
        case 'shapes':
          ({ elements, interactions } = this.generateShapesContent(request));
          break;
        case 'measurement':
          ({ elements, interactions } = this.generateMeasurementContent(request));
          break;
        case 'patterns':
          ({ elements, interactions } = this.generatePatternsContent(request));
          break;
        default:
          ({ elements, interactions } = this.generateCountingContent(request));
      }

      // Bloom 수준 설정
      const bloomLevel = this.createBloomTaxonomy(
        (request.targetBloomLevel as BloomLevel) || 'understand'
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
        this.createGradeLevel(1, achievementStandard.description.substring(0, 20)),
        this.getDefaultUDLSettings(request.accessibilityPreset),
        ['수학', '1학년', category]
      );

      const processingTime = Date.now() - startTime;
      return this.createSuccessResponse(content, processingTime);
    } catch (error) {
      return this.createErrorResponse(`콘텐츠 생성 실패: ${error}`);
    }
  }

  /**
   * 성취 기준 조회
   */
  private findAchievementStandard(code: string): AchievementStandardReference | null {
    for (const domain of MathGrade1Standards.domains) {
      for (const standard of domain.standards) {
        if (standard.code === code) {
          return {
            code: standard.code,
            description: standard.content,
            learningObjectives: [standard.explanation || standard.content],
            assessmentCriteria: standard.levelDescriptors
              ? [
                  { level: 'excellent', description: standard.levelDescriptors.excellent },
                  { level: 'good', description: standard.levelDescriptors.good },
                  { level: 'needs_improvement', description: standard.levelDescriptors.needsImprovement }
                ]
              : undefined
          };
        }
      }
    }
    return {
      code: code,
      description: '수학 학습 활동',
      learningObjectives: ['수학적 사고력을 기른다.']
    };
  }

  /**
   * 콘텐츠 카테고리 결정
   */
  private determineContentCategory(code: string): MathContentCategory {
    if (code.includes('01-01') || code.includes('01-02')) {
      return 'counting';
    } else if (code.includes('01-03')) {
      return 'addition';
    } else if (code.includes('02-')) {
      return 'shapes';
    } else if (code.includes('03-')) {
      return 'measurement';
    }
    return 'counting';
  }

  /**
   * 제목 생성
   */
  private generateTitle(category: MathContentCategory, theme?: string): string {
    const titles: Record<MathContentCategory, string[]> = {
      counting: ['하나, 둘, 셋!', '수 세기 대작전', '숫자 친구들'],
      number_recognition: ['숫자를 찾아라!', '숫자 놀이터', '숫자 카드 게임'],
      addition: ['더하기 모험', '숫자를 모아요', '덧셈 놀이'],
      subtraction: ['빼기 모험', '숫자가 줄어요', '뺄셈 놀이'],
      comparison: ['어느 것이 더 많을까?', '비교해 보아요', '크기 비교 대회'],
      shapes: ['모양 탐험대', '도형 친구들', '모양을 찾아요'],
      measurement: ['길이를 비교해요', '누가 더 길까?', '측정 모험'],
      patterns: ['규칙을 찾아요', '패턴 놀이', '다음은 무엇일까?']
    };
    const categoryTitles = titles[category];
    const baseTitle = categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
    return theme ? `${baseTitle} - ${theme}` : baseTitle;
  }

  /**
   * 수 세기 콘텐츠 생성
   */
  private generateCountingContent(request: ContentGenerationRequest): {
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
            name: '숫자 박사 나나',
            emotion: 'happy',
            dialogue: '안녕! 오늘은 수를 세어볼 거야!'
          }
        },
        0
      )
    );

    // 세기 대상 선택
    const item = COUNTING_ITEMS[Math.floor(Math.random() * COUNTING_ITEMS.length)];
    const count = Math.floor(Math.random() * 5) + 1; // 1-5

    // 그림 보여주기
    elements.push(
      this.createContentElement(
        'image',
        {
          text: `${item}가 몇 개 있을까요?`,
          imageUrl: `/images/counting/${item}_${count}.png`,
          altText: `${item} ${count}개 그림`
        },
        1
      )
    );

    // 설명
    elements.push(
      this.createContentElement(
        'text',
        {
          text: `${item}를 하나씩 세어 보세요!`,
          audioUrl: `/audio/instructions/count.mp3`
        },
        2
      )
    );

    // 터치하며 세기 상호작용
    interactions.push(
      this.createInteractionElement(
        'tap_select',
        `${item}를 하나씩 터치하며 세어 보세요!`
      )
    );

    // 정답 고르기
    const wrongAnswers = [count - 1, count + 1, count + 2].filter((n) => n > 0 && n <= 9);
    const options = [...wrongAnswers.slice(0, 3), count]
      .sort(() => Math.random() - 0.5)
      .map((num, index) => ({
        id: `num-${index}`,
        content: num.toString(),
        isCorrect: num === count
      }));

    interactions.push(
      this.createInteractionElement(
        'tap_select',
        `${item}는 모두 몇 개일까요?`,
        options
      )
    );

    return { elements, interactions };
  }

  /**
   * 숫자 인식 콘텐츠 생성
   */
  private generateNumberRecognitionContent(request: ContentGenerationRequest): {
    elements: ContentElement[];
    interactions: InteractionElement[];
  } {
    const elements: ContentElement[] = [];
    const interactions: InteractionElement[] = [];

    const targetNumber = Math.floor(Math.random() * 10); // 0-9

    elements.push(
      this.createContentElement(
        'character_dialogue',
        {
          character: {
            name: '숫자 박사 나나',
            emotion: 'curious',
            dialogue: `숫자 ${targetNumber}을/를 찾아볼까?`
          }
        },
        0
      )
    );

    // 숫자 카드
    elements.push(
      this.createContentElement(
        'image',
        {
          text: `숫자 ${targetNumber}`,
          imageUrl: `/images/numbers/${targetNumber}.png`,
          audioUrl: `/audio/numbers/${targetNumber}.mp3`,
          altText: `숫자 ${targetNumber}`
        },
        1
      )
    );

    // 숫자 찾기
    const numbers = Array.from({ length: 10 }, (_, i) => i);
    const shuffled = numbers.sort(() => Math.random() - 0.5).slice(0, 6);
    if (!shuffled.includes(targetNumber)) {
      shuffled[0] = targetNumber;
      shuffled.sort(() => Math.random() - 0.5);
    }

    const options = shuffled.map((num, index) => ({
      id: `num-${index}`,
      content: num.toString(),
      imageUrl: `/images/numbers/${num}.png`,
      isCorrect: num === targetNumber
    }));

    interactions.push(
      this.createInteractionElement(
        'tap_select',
        `숫자 ${targetNumber}을/를 찾아 눌러 보세요!`,
        options
      )
    );

    return { elements, interactions };
  }

  /**
   * 덧셈 콘텐츠 생성
   */
  private generateAdditionContent(request: ContentGenerationRequest): {
    elements: ContentElement[];
    interactions: InteractionElement[];
  } {
    const elements: ContentElement[] = [];
    const interactions: InteractionElement[] = [];

    // 한 자리 수 덧셈 (합이 9 이하)
    const num1 = Math.floor(Math.random() * 5) + 1; // 1-5
    const num2 = Math.floor(Math.random() * (9 - num1)) + 1; // 1 ~ (9-num1)
    const answer = num1 + num2;

    const item = COUNTING_ITEMS[Math.floor(Math.random() * COUNTING_ITEMS.length)];

    elements.push(
      this.createContentElement(
        'character_dialogue',
        {
          character: {
            name: '숫자 박사 나나',
            emotion: 'encouraging',
            dialogue: '더하기를 해볼까요? 모으면 몇 개가 될까?'
          }
        },
        0
      )
    );

    // 시각적 덧셈 표현
    elements.push(
      this.createContentElement(
        'image',
        {
          text: `${item} ${num1}개와 ${num2}개를 모으면?`,
          imageUrl: `/images/addition/${item}_${num1}_${num2}.png`,
          altText: `${item} ${num1}개 더하기 ${num2}개`
        },
        1
      )
    );

    // 덧셈식
    elements.push(
      this.createContentElement(
        'text',
        {
          text: `${num1} + ${num2} = ?`,
          audioUrl: `/audio/math/${num1}_plus_${num2}.mp3`
        },
        2
      )
    );

    // 정답 고르기
    const wrongAnswers = [answer - 1, answer + 1, answer + 2].filter((n) => n > 0 && n <= 9);
    const options = [...wrongAnswers, answer]
      .sort(() => Math.random() - 0.5)
      .map((num, index) => ({
        id: `ans-${index}`,
        content: num.toString(),
        isCorrect: num === answer
      }));

    interactions.push(
      this.createInteractionElement(
        'tap_select',
        `${num1} + ${num2}는 얼마일까요?`,
        options
      )
    );

    // 드래그하여 모으기
    interactions.push(
      this.createInteractionElement(
        'drag_drop',
        `${item}를 한 곳으로 모아보세요!`
      )
    );

    return { elements, interactions };
  }

  /**
   * 뺄셈 콘텐츠 생성
   */
  private generateSubtractionContent(request: ContentGenerationRequest): {
    elements: ContentElement[];
    interactions: InteractionElement[];
  } {
    const elements: ContentElement[] = [];
    const interactions: InteractionElement[] = [];

    // 한 자리 수 뺄셈
    const num1 = Math.floor(Math.random() * 5) + 4; // 4-8
    const num2 = Math.floor(Math.random() * (num1 - 1)) + 1; // 1 ~ (num1-1)
    const answer = num1 - num2;

    const item = COUNTING_ITEMS[Math.floor(Math.random() * COUNTING_ITEMS.length)];

    elements.push(
      this.createContentElement(
        'character_dialogue',
        {
          character: {
            name: '숫자 박사 나나',
            emotion: 'curious',
            dialogue: '빼기를 해볼까요? 가져가면 몇 개가 남을까?'
          }
        },
        0
      )
    );

    // 시각적 뺄셈 표현
    elements.push(
      this.createContentElement(
        'image',
        {
          text: `${item} ${num1}개에서 ${num2}개를 가져가면?`,
          imageUrl: `/images/subtraction/${item}_${num1}_${num2}.png`,
          altText: `${item} ${num1}개 빼기 ${num2}개`
        },
        1
      )
    );

    // 뺄셈식
    elements.push(
      this.createContentElement(
        'text',
        {
          text: `${num1} - ${num2} = ?`,
          audioUrl: `/audio/math/${num1}_minus_${num2}.mp3`
        },
        2
      )
    );

    // 정답 고르기
    const wrongAnswers = [answer - 1, answer + 1, answer + 2].filter((n) => n >= 0 && n <= 9);
    const options = [...new Set([...wrongAnswers, answer])]
      .slice(0, 4)
      .sort(() => Math.random() - 0.5)
      .map((num, index) => ({
        id: `ans-${index}`,
        content: num.toString(),
        isCorrect: num === answer
      }));

    interactions.push(
      this.createInteractionElement(
        'tap_select',
        `${num1} - ${num2}는 얼마일까요?`,
        options
      )
    );

    return { elements, interactions };
  }

  /**
   * 비교 콘텐츠 생성
   */
  private generateComparisonContent(request: ContentGenerationRequest): {
    elements: ContentElement[];
    interactions: InteractionElement[];
  } {
    const elements: ContentElement[] = [];
    const interactions: InteractionElement[] = [];

    const num1 = Math.floor(Math.random() * 7) + 2; // 2-8
    let num2 = Math.floor(Math.random() * 7) + 2;
    while (num2 === num1) {
      num2 = Math.floor(Math.random() * 7) + 2;
    }

    const item = COUNTING_ITEMS[Math.floor(Math.random() * COUNTING_ITEMS.length)];

    elements.push(
      this.createContentElement(
        'character_dialogue',
        {
          character: {
            name: '숫자 박사 나나',
            emotion: 'thinking',
            dialogue: '어느 쪽이 더 많을까? 비교해 보자!'
          }
        },
        0
      )
    );

    // 두 그룹 비교
    elements.push(
      this.createContentElement(
        'image',
        {
          text: `왼쪽: ${item} ${num1}개, 오른쪽: ${item} ${num2}개`,
          imageUrl: `/images/comparison/${item}_${num1}_${num2}.png`,
          altText: `${item} ${num1}개와 ${num2}개 비교`
        },
        1
      )
    );

    // 더 많은 쪽 선택
    const options = [
      { id: 'left', content: `왼쪽 (${num1}개)`, isCorrect: num1 > num2 },
      { id: 'right', content: `오른쪽 (${num2}개)`, isCorrect: num2 > num1 }
    ];

    interactions.push(
      this.createInteractionElement(
        'tap_select',
        '어느 쪽이 더 많을까요?',
        options
      )
    );

    return { elements, interactions };
  }

  /**
   * 도형 콘텐츠 생성
   */
  private generateShapesContent(request: ContentGenerationRequest): {
    elements: ContentElement[];
    interactions: InteractionElement[];
  } {
    const elements: ContentElement[] = [];
    const interactions: InteractionElement[] = [];

    const shapes = [
      { name: '동그라미', shape: 'circle' },
      { name: '세모', shape: 'triangle' },
      { name: '네모', shape: 'square' }
    ];

    const targetShape = shapes[Math.floor(Math.random() * shapes.length)];

    elements.push(
      this.createContentElement(
        'character_dialogue',
        {
          character: {
            name: '숫자 박사 나나',
            emotion: 'happy',
            dialogue: '여러 가지 모양을 찾아볼까요?'
          }
        },
        0
      )
    );

    // 모양 소개
    elements.push(
      this.createContentElement(
        'image',
        {
          text: `이것은 ${targetShape.name}이에요!`,
          imageUrl: `/images/shapes/${targetShape.shape}.png`,
          audioUrl: `/audio/shapes/${targetShape.shape}.mp3`,
          altText: targetShape.name
        },
        1
      )
    );

    // 같은 모양 찾기
    const options = shapes.map((s, i) => ({
      id: `shape-${i}`,
      content: s.name,
      imageUrl: `/images/shapes/${s.shape}.png`,
      isCorrect: s.name === targetShape.name
    }));

    interactions.push(
      this.createInteractionElement(
        'tap_select',
        `${targetShape.name}을/를 찾아 눌러 보세요!`,
        options
      )
    );

    // 실생활에서 찾기
    elements.push(
      this.createContentElement(
        'text',
        {
          text: `우리 주변에서 ${targetShape.name}을/를 찾아볼까요?`,
          altText: `${targetShape.name} 실생활 예시`
        },
        2
      )
    );

    return { elements, interactions };
  }

  /**
   * 측정 콘텐츠 생성
   */
  private generateMeasurementContent(request: ContentGenerationRequest): {
    elements: ContentElement[];
    interactions: InteractionElement[];
  } {
    const elements: ContentElement[] = [];
    const interactions: InteractionElement[] = [];

    const comparisons = [
      { type: '길이', question: '어느 것이 더 길까요?', attribute: 'long' },
      { type: '높이', question: '어느 것이 더 높을까요?', attribute: 'tall' },
      { type: '크기', question: '어느 것이 더 클까요?', attribute: 'big' }
    ];

    const comparison = comparisons[Math.floor(Math.random() * comparisons.length)];

    elements.push(
      this.createContentElement(
        'character_dialogue',
        {
          character: {
            name: '숫자 박사 나나',
            emotion: 'curious',
            dialogue: `${comparison.type}를 비교해 볼까요?`
          }
        },
        0
      )
    );

    // 비교 이미지
    elements.push(
      this.createContentElement(
        'image',
        {
          text: comparison.question,
          imageUrl: `/images/measurement/${comparison.attribute}_comparison.png`,
          altText: `${comparison.type} 비교 그림`
        },
        1
      )
    );

    // 선택
    const options = [
      { id: 'left', content: '왼쪽', isCorrect: true },
      { id: 'right', content: '오른쪽', isCorrect: false }
    ].sort(() => Math.random() - 0.5);

    interactions.push(
      this.createInteractionElement(
        'tap_select',
        comparison.question,
        options
      )
    );

    return { elements, interactions };
  }

  /**
   * 패턴 콘텐츠 생성
   */
  private generatePatternsContent(request: ContentGenerationRequest): {
    elements: ContentElement[];
    interactions: InteractionElement[];
  } {
    const elements: ContentElement[] = [];
    const interactions: InteractionElement[] = [];

    // 간단한 AB 패턴
    const patternItems = ['빨강', '파랑'];
    const pattern = ['빨강', '파랑', '빨강', '파랑', '?'];

    elements.push(
      this.createContentElement(
        'character_dialogue',
        {
          character: {
            name: '숫자 박사 나나',
            emotion: 'thinking',
            dialogue: '규칙을 찾아볼까요? 다음엔 무엇이 올까?'
          }
        },
        0
      )
    );

    // 패턴 보여주기
    elements.push(
      this.createContentElement(
        'image',
        {
          text: pattern.join(' → '),
          imageUrl: `/images/patterns/color_pattern.png`,
          altText: '색깔 패턴: 빨강, 파랑, 빨강, 파랑, ?'
        },
        1
      )
    );

    // 다음 것 고르기
    const options = patternItems.map((item, i) => ({
      id: `pattern-${i}`,
      content: item,
      isCorrect: item === '빨강'
    }));

    interactions.push(
      this.createInteractionElement(
        'tap_select',
        '물음표에 들어갈 것을 고르세요!',
        options
      )
    );

    return { elements, interactions };
  }
}
