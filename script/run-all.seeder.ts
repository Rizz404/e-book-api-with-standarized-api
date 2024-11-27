import fs from "fs";
import path from "path";

const runAllSeeders = async () => {
  const seederDir = path.resolve(__dirname, "../src/api");
  const features = fs.readdirSync(seederDir);

  for (const feature of features) {
    const seederPath = path.resolve(seederDir, feature, `${feature}.seeder.ts`);

    if (fs.existsSync(seederPath)) {
      try {
        const seeder = await import(seederPath);

        if (seeder.default) {
          await seeder.default();
          console.log(`${feature} seeder executed successfully.`);
        } else {
          console.warn(`${seederPath} does not export a default function.`);
        }
      } catch (error) {
        console.error(`Failed to run seeder for ${feature}:`, error);
      }
    }
  }
};

runAllSeeders()
  .then(() => console.log("All seeders executed successfully."))
  .catch((error) => {
    console.error("Failed to execute seeders:", error);
    process.exit(1);
  });
