/**
 * AI-Edu 콘텐츠 생성 웹 서버
 * 브라우저에서 콘텐츠를 생성할 수 있는 간단한 웹 인터페이스 제공
 */

import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { ContentGeneratorFactory } from './src/generators';

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 메인 페이지
  if (req.url === '/' || req.url === '/index.html') {
    const htmlPath = path.join(__dirname, 'web', 'index.html');
    try {
      const html = fs.readFileSync(htmlPath, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch (error) {
      res.writeHead(500);
      res.end('파일을 찾을 수 없습니다.');
    }
    return;
  }

  // API: 콘텐츠 생성
  if (req.url === '/api/generate' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);

        console.log('\n📚 콘텐츠 생성 요청:');
        console.log('  - 교과:', data.subject);
        console.log('  - 성취기준:', data.achievementStandardCode);
        console.log('  - 테마:', data.theme || '(없음)');

        const result = await ContentGeneratorFactory.generateContent({
          subject: data.subject,
          achievementStandardCode: data.achievementStandardCode,
          contentType: data.contentType || 'lesson',
          targetBloomLevel: data.targetBloomLevel || 'understand',
          theme: data.theme
        });

        if (result.success) {
          console.log('  ✅ 생성 완료:', result.content?.title);
        } else {
          console.log('  ❌ 생성 실패:', result.error);
        }

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
      } catch (error) {
        console.error('오류:', error);
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: '서버 오류가 발생했습니다.' }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404);
  res.end('페이지를 찾을 수 없습니다.');
});

server.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║                                                       ║');
  console.log('║   🎓 AI-Edu 콘텐츠 생성기가 시작되었습니다!           ║');
  console.log('║                                                       ║');
  console.log('║   👉 브라우저에서 아래 주소를 열어주세요:             ║');
  console.log('║                                                       ║');
  console.log(`║   📎 http://localhost:${PORT}                            ║`);
  console.log('║                                                       ║');
  console.log('║   종료하려면 Ctrl+C 를 누르세요                       ║');
  console.log('║                                                       ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('');
});
