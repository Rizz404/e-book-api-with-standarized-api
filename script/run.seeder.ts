import path from "path";

const runSeeder = async () => {
  const args = process.argv.slice(2); // * Ambil argumen dari CLI
  if (args.length === 0) {
    console.error("Please provide a seeder file name.");
    process.exit(1);
  }

  const seederName = args[0];
  const seederPath = path.resolve(__dirname, "../src/api/", seederName);

  try {
    const seeder = await import(seederPath); // * Import seeder

    if (seeder.default) {
      await seeder.default(); // * Jalankan fungsi default
      console.log(`${seederName} has been seeded successfully.`);
    } else {
      console.error(`${seederName} does not export a default function.`);
    }
  } catch (error) {
    console.error(`Failed to run seeder ${seederName}:`, error);
    process.exit(1);
  }
};

runSeeder();
