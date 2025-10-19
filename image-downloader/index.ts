import { migrateImages } from "./migrateImages.js";

async function main() {
  try {
    await migrateImages();
    console.log("\n✓ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n✗ Migration failed:", error);
    process.exit(1);
  }
}

main();
