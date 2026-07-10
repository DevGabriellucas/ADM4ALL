import path from "path";
import { config as loadDotenv } from "dotenv";

const envPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "..", ".env"),
  path.resolve(__dirname, "../../../.env"),
  path.resolve(__dirname, "../../../../.env"),
];

for (const envPath of [...new Set(envPaths)]) {
  loadDotenv({ path: envPath });
}
