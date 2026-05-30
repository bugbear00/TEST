// 아주 단순한 CSV 파서 (Stooq 응답용). 따옴표 안 쉼표는 다루지 않는다.
// Stooq 응답에는 따옴표가 거의 없어 충분하다.

/**
 * @param {string} text
 * @returns {Array<Record<string,string>>}
 */
export function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    const row = {};
    header.forEach((h, i) => {
      row[h] = (cells[i] ?? "").trim();
    });
    return row;
  });
}

/** Stooq 에서 값이 없을 때 쓰는 표기 판별 */
export function isStooqMissing(v) {
  return v == null || v === "" || v === "N/D" || v === "N/A";
}
