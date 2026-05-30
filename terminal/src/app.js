// Express 앱 정의 (listen 하지 않음).
// - 로컬/Docker/Render: server.js 가 이 앱에 정적 서빙을 추가하고 listen.
// - Vercel: api/[...path].js 가 이 앱을 서버리스 핸들러로 export (정적은 Vercel CDN 담당).
import express from "express";
import { api } from "./routes/api.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");

  // 비로그인 사용자도 일반 시장 데이터를 볼 수 있도록 공개(읽기 전용) API + 단순 CORS.
  app.use("/api", (req, res, next) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Cache-Control", "no-store");
    next();
  });
  app.use("/api", api);

  return app;
}

export default createApp();
