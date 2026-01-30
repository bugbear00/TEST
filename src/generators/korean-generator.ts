/**
 * 국어 콘텐츠 생성기
 * 초등 1학년 국어 학습 콘텐츠 생성
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
  KoreanGrade1Standards
} from '../types';

/** 국어 콘텐츠 유형 */
type KoreanContentCategory =
  | 'phonics'           // 파닉스 (자음/모음)
  | 'syllable'          // 음절/글자
  | 'word'              // 낱말
  | 'sentence'          // 문장
  | 'reading'           // 읽기
  | 'writing'           // 쓰기
  | 'listening_speaking'; // 듣기/말하기

/** 한글 자음 */
const KOREAN_CONSONANTS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

/** 한글 모음 */
const KOREAN_VOWELS = ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ'];

/** 기초 낱말 목록 */
const BASIC_WORDS: Record<string, string[]> = {
  가족: ['아빠', '엄마', '할머니', '할아버지', '언니', '오빠', '동생'],
  학교: ['선생님', '친구', '교실', '책상', '의자', '칠판', '가방'],
  동물: ['강아지', '고양이', '토끼', '새', '물고기', '호랑이', '곰'],
  과일: ['사과', '바나나', '포도', '수박', '딸기', '귤', '배'],
  자연: ['하늘', '구름', '나무', '꽃', '바다', '산', '강']
};

/**
 * 국어 콘텐츠 생성기
 */
export class KoreanContentGenerator extends BaseContentGenerator {
  protected subject: Subject = 'korean';

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
        case 'phonics':
          ({ elements, interactions } = this.generatePhonicsContent(request));
          break;
        case 'syllable':
          ({ elements, interactions } = this.generateSyllableContent(request));
          break;
        case 'word':
          ({ elements, interactions } = this.generateWordContent(request));
          break;
        case 'reading':
          ({ elements, interactions } = this.generateReadingContent(request));
          break;
        case 'writing':
          ({ elements, interactions } = this.generateWritingContent(request));
          break;
        case 'listening_speaking':
          ({ elements, interactions } = this.generateListeningSpeakingContent(request));
          break;
        default:
          ({ elements, interactions } = this.generateGenericContent(request));
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
        ['국어', '1학년', category]
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
    for (const domain of KoreanGrade1Standards.domains) {
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
    // 기본 성취 기준 반환
    return {
      code: code,
      description: '국어 학습 활동',
      learningObjectives: ['국어 기초 능력을 기른다.']
    };
  }

  /**
   * 콘텐츠 카테고리 결정
   */
  private determineContentCategory(code: string): KoreanContentCategory {
    if (code.includes('02-01') || code.includes('02-02')) {
      return 'phonics';
    } else if (code.includes('03-01')) {
      return 'writing';
    } else if (code.includes('01-')) {
      return 'listening_speaking';
    }
    return 'word';
  }

  /**
   * 제목 생성
   */
  private generateTitle(category: KoreanContentCategory, theme?: string): string {
    const titles: Record<KoreanContentCategory, string[]> = {
      phonics: ['재미있는 글자 나라', '자음과 모음 친구들', '소리와 글자 탐험'],
      syllable: ['글자를 만들어요', '소리를 모아요', '재미있는 글자 조합'],
      word: ['낱말 친구들', '그림으로 배우는 낱말', '신나는 낱말 여행'],
      sentence: ['문장을 만들어요', '이야기를 써요', '내 생각 표현하기'],
      reading: ['함께 읽어요', '재미있는 읽기', '이야기 속으로'],
      writing: ['예쁘게 써요', '글자 따라 쓰기', '나만의 글씨'],
      listening_speaking: ['귀 쫑긋 입 쫑긋', '친구와 이야기해요', '바르게 듣고 말해요']
    };
    const categoryTitles = titles[category];
    const baseTitle = categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
    return theme ? `${baseTitle} - ${theme}` : baseTitle;
  }

  /**
   * 파닉스 콘텐츠 생성
   */
  private generatePhonicsContent(request: ContentGenerationRequest): {
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
            name: '글자 요정 또또',
            emotion: 'happy',
            dialogue: '안녕! 오늘은 재미있는 글자를 배워볼 거야!'
          }
        },
        0
      )
    );

    // 자음 또는 모음 선택
    const isConsonant = Math.random() > 0.5;
    const letters = isConsonant ? KOREAN_CONSONANTS.slice(0, 5) : KOREAN_VOWELS.slice(0, 5);
    const targetLetter = letters[Math.floor(Math.random() * letters.length)];

    // 글자 소개
    elements.push(
      this.createContentElement(
        'text',
        {
          text: `오늘 배울 글자는 "${targetLetter}" 이에요!`,
          altText: `글자 ${targetLetter} 소개`
        },
        1
      )
    );

    // 애니메이션 (획순)
    elements.push(
      this.createContentElement(
        'animation',
        {
          text: `${targetLetter} 쓰는 순서를 함께 봐요!`,
          altText: `${targetLetter} 획순 애니메이션`
        },
        2
      )
    );

    // 따라 쓰기 상호작용
    interactions.push(
      this.createInteractionElement('draw', `${targetLetter}을/를 손가락으로 따라 써 보세요!`)
    );

    // 글자 찾기 상호작용
    const wrongLetters = letters.filter((l) => l !== targetLetter).slice(0, 3);
    const options = [...wrongLetters, targetLetter]
      .sort(() => Math.random() - 0.5)
      .map((letter, index) => ({
        id: `opt-${index}`,
        content: letter,
        isCorrect: letter === targetLetter
      }));

    interactions.push(
      this.createInteractionElement(
        'tap_select',
        `"${targetLetter}"을/를 찾아서 눌러 보세요!`,
        options
      )
    );

    return { elements, interactions };
  }

  /**
   * 음절 콘텐츠 생성
   */
  private generateSyllableContent(request: ContentGenerationRequest): {
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
            name: '글자 요정 또또',
            emotion: 'curious',
            dialogue: '자음과 모음을 합치면 어떤 소리가 날까?'
          }
        },
        0
      )
    );

    // 간단한 음절 예시
    const syllables = ['가', '나', '다', '마', '바'];
    const targetSyllable = syllables[Math.floor(Math.random() * syllables.length)];

    elements.push(
      this.createContentElement(
        'text',
        {
          text: `"${targetSyllable}" - 소리를 들어보세요!`,
          audioUrl: `/audio/syllables/${targetSyllable}.mp3`
        },
        1
      )
    );

    // 소리 듣고 고르기
    const options = syllables.slice(0, 4).map((s, i) => ({
      id: `syl-${i}`,
      content: s,
      isCorrect: s === targetSyllable
    }));

    interactions.push(
      this.createInteractionElement(
        'tap_select',
        '소리를 듣고 맞는 글자를 골라보세요!',
        options
      )
    );

    return { elements, interactions };
  }

  /**
   * 낱말 콘텐츠 생성
   */
  private generateWordContent(request: ContentGenerationRequest): {
    elements: ContentElement[];
    interactions: InteractionElement[];
  } {
    const elements: ContentElement[] = [];
    const interactions: InteractionElement[] = [];

    // 테마 선택
    const themes = Object.keys(BASIC_WORDS);
    const theme = request.theme || themes[Math.floor(Math.random() * themes.length)];
    const words = BASIC_WORDS[theme] || BASIC_WORDS['가족'];

    elements.push(
      this.createContentElement(
        'character_dialogue',
        {
          character: {
            name: '글자 요정 또또',
            emotion: 'happy',
            dialogue: `오늘은 ${theme}에 대한 낱말을 배워볼까?`
          }
        },
        0
      )
    );

    // 낱말 카드
    const selectedWords = words.slice(0, 4);
    selectedWords.forEach((word, index) => {
      elements.push(
        this.createContentElement(
          'text',
          {
            text: word,
            imageUrl: `/images/words/${word}.png`,
            audioUrl: `/audio/words/${word}.mp3`,
            altText: `${word} 그림과 글자`
          },
          index + 1
        )
      );
    });

    // 그림-낱말 매칭
    const targetWord = selectedWords[0];
    const options = selectedWords.map((w, i) => ({
      id: `word-${i}`,
      content: w,
      imageUrl: `/images/words/${w}.png`,
      isCorrect: w === targetWord
    }));

    interactions.push(
      this.createInteractionElement(
        'matching',
        `그림을 보고 맞는 낱말을 찾아 연결해 보세요!`,
        options
      )
    );

    return { elements, interactions };
  }

  /**
   * 읽기 콘텐츠 생성
   */
  private generateReadingContent(request: ContentGenerationRequest): {
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
            name: '글자 요정 또또',
            emotion: 'encouraging',
            dialogue: '함께 이야기를 읽어볼까요?'
          }
        },
        0
      )
    );

    // 짧은 문장
    const sentences = [
      '강아지가 뛰어요.',
      '고양이가 자요.',
      '새가 노래해요.',
      '토끼가 뛰어요.'
    ];

    const targetSentence = sentences[Math.floor(Math.random() * sentences.length)];

    elements.push(
      this.createContentElement(
        'text',
        {
          text: targetSentence,
          audioUrl: `/audio/sentences/sentence1.mp3`,
          altText: targetSentence
        },
        1
      )
    );

    // 문장 완성 문제
    const parts = targetSentence.split(' ');
    if (parts.length >= 2) {
      const options = [
        { id: 'opt-1', content: parts[1], isCorrect: true },
        { id: 'opt-2', content: '먹어요.', isCorrect: false },
        { id: 'opt-3', content: '울어요.', isCorrect: false }
      ].sort(() => Math.random() - 0.5);

      interactions.push(
        this.createInteractionElement(
          'fill_blank',
          `"${parts[0]} ____" 빈칸에 들어갈 말을 고르세요!`,
          options
        )
      );
    }

    return { elements, interactions };
  }

  /**
   * 쓰기 콘텐츠 생성
   */
  private generateWritingContent(request: ContentGenerationRequest): {
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
            name: '글자 요정 또또',
            emotion: 'encouraging',
            dialogue: '예쁜 글씨를 써볼까요? 천천히 따라 써 봐요!'
          }
        },
        0
      )
    );

    const letters = ['가', '나', '다', '라', '마'];
    const targetLetter = letters[Math.floor(Math.random() * letters.length)];

    // 획순 애니메이션
    elements.push(
      this.createContentElement(
        'animation',
        {
          text: `"${targetLetter}" 쓰는 순서를 잘 봐요!`,
          altText: `${targetLetter} 획순 애니메이션`
        },
        1
      )
    );

    // 점선 따라쓰기
    elements.push(
      this.createContentElement(
        'image',
        {
          text: `점선을 따라 "${targetLetter}"을/를 써 보세요!`,
          imageUrl: `/images/writing/trace_${targetLetter}.png`,
          altText: `${targetLetter} 따라쓰기 가이드`
        },
        2
      )
    );

    // 쓰기 상호작용
    interactions.push(
      this.createInteractionElement('draw', `"${targetLetter}"을/를 손가락으로 써 보세요!`)
    );

    return { elements, interactions };
  }

  /**
   * 듣기/말하기 콘텐츠 생성
   */
  private generateListeningSpeakingContent(request: ContentGenerationRequest): {
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
            name: '글자 요정 또또',
            emotion: 'happy',
            dialogue: '친구에게 인사해 볼까요?'
          }
        },
        0
      )
    );

    // 인사말 상황
    const greetings = [
      { situation: '아침에 만났을 때', greeting: '안녕하세요!' },
      { situation: '헤어질 때', greeting: '안녕히 가세요!' },
      { situation: '고마울 때', greeting: '감사합니다!' },
      { situation: '미안할 때', greeting: '죄송합니다!' }
    ];

    const selectedGreeting = greetings[Math.floor(Math.random() * greetings.length)];

    elements.push(
      this.createContentElement(
        'text',
        {
          text: `${selectedGreeting.situation}`,
          imageUrl: `/images/situations/greeting.png`,
          altText: selectedGreeting.situation
        },
        1
      )
    );

    // 음성 듣기
    elements.push(
      this.createContentElement(
        'audio',
        {
          text: '소리를 들어보세요!',
          audioUrl: `/audio/greetings/greeting1.mp3`
        },
        2
      )
    );

    // 따라 말하기
    interactions.push(
      this.createInteractionElement(
        'voice_input',
        `"${selectedGreeting.greeting}" 따라 말해 보세요!`
      )
    );

    // 상황에 맞는 인사 고르기
    const options = greetings.map((g, i) => ({
      id: `greeting-${i}`,
      content: g.greeting,
      isCorrect: g === selectedGreeting
    }));

    interactions.push(
      this.createInteractionElement(
        'tap_select',
        `${selectedGreeting.situation} 어떻게 말할까요?`,
        options
      )
    );

    return { elements, interactions };
  }

  /**
   * 일반 콘텐츠 생성 (기본)
   */
  private generateGenericContent(request: ContentGenerationRequest): {
    elements: ContentElement[];
    interactions: InteractionElement[];
  } {
    return this.generateWordContent(request);
  }
}
