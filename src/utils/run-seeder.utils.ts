import fs from "fs";
import path from "path";

const runSeeder = async () => {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("❌ Please provide a seeder file name.");
    process.exit(1);
  }

  const seederName = args[0];
  const baseSeederName = seederName.replace(/\.ts$/, "");
  const seederPath = path.join(process.cwd(), "src", "api", baseSeederName);

  console.log("Checking paths:");
  console.log("Base path:", process.cwd());
  console.log("Seeder path:", seederPath);

  const tsFile = seederPath + ".ts";
  const jsFile = seederPath + ".js";

  console.log("TS file exists:", fs.existsSync(tsFile));
  console.log("JS file exists:", fs.existsSync(jsFile));

  if (!fs.existsSync(tsFile) && !fs.existsSync(jsFile)) {
    console.error(`❌ Seeder file "${seederName}" not found.`);
    console.log(`🔍 Checked paths:\nTS: ${tsFile}\nJS: ${jsFile}`);
    process.exit(1);
  }

  try {
    // Gunakan require sebagai gantinya
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const seeder = require(tsFile);

    if (typeof seeder.default === "function") {
      await seeder.default();
      console.log(`✅ Seeder "${seederName}" has been seeded successfully.`);
      process.exit(1);
    } else {
      console.error(
        `❌ Seeder "${seederName}" does not export a default function.`,
      );
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Failed to run seeder "${seederName}":`, error);
    process.exit(1);
  }
};

runSeeder();
