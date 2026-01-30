/**
 * 콘텐츠 생성 테스트
 */
import { ContentGeneratorFactory } from './src/generators';

async function main() {
  console.log('=== AI-Edu 콘텐츠 생성 테스트 ===\n');

  // 1. 국어 콘텐츠 생성
  console.log('1. 국어 파닉스 콘텐츠 생성...');
  const koreanResult = await ContentGeneratorFactory.generateContent({
    subject: 'korean',
    achievementStandardCode: '[1국어02-01]',
    contentType: 'lesson',
    targetBloomLevel: 'understand',
    theme: '가족'
  });

  if (koreanResult.success && koreanResult.content) {
    console.log('✓ 생성 완료!');
    console.log('  - 제목:', koreanResult.content.title);
    console.log('  - 교과:', koreanResult.content.subject);
    console.log('  - 성취기준:', koreanResult.content.achievementStandard.code);
    console.log('  - Bloom 수준:', koreanResult.content.bloomLevel.primaryLevel);
    console.log('  - 콘텐츠 요소 수:', koreanResult.content.content.elements?.length || 0);
    console.log('  - 상호작용 수:', koreanResult.content.content.interactions?.length || 0);
  }

  console.log('\n2. 수학 수 세기 콘텐츠 생성...');
  const mathResult = await ContentGeneratorFactory.generateContent({
    subject: 'math',
    achievementStandardCode: '[1수학01-01]',
    contentType: 'practice',
    targetBloomLevel: 'apply',
    theme: '과일'
  });

  if (mathResult.success && mathResult.content) {
    console.log('✓ 생성 완료!');
    console.log('  - 제목:', mathResult.content.title);
    console.log('  - 교과:', mathResult.content.subject);
    console.log('  - 성취기준:', mathResult.content.achievementStandard.code);
  }

  console.log('\n3. 디지털 리터러시 콘텐츠 생성...');
  const digitalResult = await ContentGeneratorFactory.generateContent({
    subject: 'digital_literacy',
    achievementStandardCode: '[1디지털01-01]',
    contentType: 'lesson',
    targetBloomLevel: 'apply'
  });

  if (digitalResult.success && digitalResult.content) {
    console.log('✓ 생성 완료!');
    console.log('  - 제목:', digitalResult.content.title);
    console.log('  - 교과:', digitalResult.content.subject);
  }

  // 전체 JSON 출력 (국어 콘텐츠)
  console.log('\n=== 생성된 국어 콘텐츠 JSON (일부) ===');
  if (koreanResult.success && koreanResult.content) {
    const sample = {
      id: koreanResult.content.id,
      title: koreanResult.content.title,
      subject: koreanResult.content.subject,
      achievementStandard: koreanResult.content.achievementStandard,
      bloomLevel: koreanResult.content.bloomLevel,
      arcsElements: {
        attention: koreanResult.content.arcsElements.attention?.strategy,
        relevance: koreanResult.content.arcsElements.relevance?.realWorldConnection,
        confidence: koreanResult.content.arcsElements.confidence?.successCriteria,
        satisfaction: koreanResult.content.arcsElements.satisfaction?.feedbackType
      }
    };
    console.log(JSON.stringify(sample, null, 2));
  }

  console.log('\n=== 테스트 완료 ===');
}

main().catch(console.error);
