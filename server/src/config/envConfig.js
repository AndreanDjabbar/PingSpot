import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = process.env.NODE_ENV === "development"
    ? path.join(__dirname, "../../.env.dev")
    : path.join(__dirname, "../../.env.prod");

dotenv.config({ path: envPath });