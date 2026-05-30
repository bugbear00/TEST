// 미국주식 한국어 금융 터미널 - Express 서버
// 정적 프런트엔드(public/) 를 서빙하고 /api 로 데이터 프록시를 제공한다.
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { api } from "./routes/api.js";
import { PORT } from "./config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.disable("x-powered-by");

// 비로그인 사용자도 일반 시장 데이터를 볼 수 있도록 공개 API.
// 외부 임베드를 막지 않기 위해 단순 CORS 허용(읽기 전용 데이터).
app.use("/api", (req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Cache-Control", "no-store");
  next();
});

app.use("/api", api);

app.use(express.static(path.join(__dirname, "..", "public")));

// SPA 폴백
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`[터미널] http://localhost:${PORT} 에서 실행 중`);
});
