// run-seed.cjs — carga .env.local y ejecuta seed-books.ts
const fs = require("fs");
const path = require("path");
const envFile = path.join(__dirname, "..", ".env.local");
const envText = fs.readFileSync(envFile, "utf8");
const lines = envText.split("\n");
for (const line of lines) {
  const eqIdx = line.indexOf("=");
  if (eqIdx > 0) {
    const key = line.slice(0, eqIdx).trim();
    const val = line.slice(eqIdx + 1).trim();
    if (key.startsWith("NEXT_PUBLIC_SUPABASE") || key.startsWith("SUPABASE_SERVICE")) {
      process.env[key] = val;
    }
  }
}
require("tsx/cjs");
require("./seed-books.ts");
