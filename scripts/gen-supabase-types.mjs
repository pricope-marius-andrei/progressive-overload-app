import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const projectId = process.env.SUPABASE_PROJECT_ID;
const schema = process.env.SUPABASE_SCHEMA || "public";
const outFile = "types/database.types.ts";

if (!projectId) {
  console.error("Missing SUPABASE_PROJECT_ID env var.");
  console.error(
    "Example (PowerShell): $env:SUPABASE_PROJECT_ID='your_project_id'",
  );
  process.exit(1);
}

const cmd = `npx supabase gen types typescript --project-id ${projectId} --schema ${schema}`;
const output = execSync(cmd, {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, output, "utf8");

console.log(`Generated: ${outFile}`);
