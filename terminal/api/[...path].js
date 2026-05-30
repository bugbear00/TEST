// Vercel 서버리스 함수 진입점.
// /api/* 로 들어오는 모든 요청을 Express 앱으로 위임한다.
// (정적 파일 public/* 는 Vercel CDN 이 직접 서빙한다.)
import app from "../src/app.js";

export default app;
