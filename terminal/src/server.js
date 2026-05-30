// 로컬 / Docker / Render 용 서버 진입점.
// 정적 프런트엔드(public/) 를 서빙하고 listen 한다.
// (Vercel 에서는 정적 서빙을 CDN 이 담당하므로 이 파일을 쓰지 않는다.)
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import app from "./app.js";
import { PORT } from "./config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

app.use(express.static(publicDir));
app.get("*", (_req, res) => res.sendFile(path.join(publicDir, "index.html")));

app.listen(PORT, () => {
  console.log(`[터미널] http://localhost:${PORT} 에서 실행 중`);
});
