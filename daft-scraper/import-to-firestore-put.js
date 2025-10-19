import fs from "fs";
import admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

async function importDataWithPut() {
  const data = JSON.parse(
    fs.readFileSync("cleaning/cleaned_properties.json", "utf8"),
  );

  console.log(`Starting import of ${data.length} properties...`);

  for (let i = 0; i < data.length; i++) {
    const property = data[i];

    if (property && property.id) {
      const docRef = db.collection("properties").doc(property.id.toString());
      await docRef.set(property);

      if ((i + 1) % 100 === 0) {
        console.log(`Imported ${i + 1}/${data.length} properties...`);
      }
    }
  }

  console.log(`✓ Import complete! Imported ${data.length} properties`);
}

importDataWithPut().catch(console.error);
