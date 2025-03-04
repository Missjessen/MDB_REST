import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { userModel } from "../models/userModel";

const MONGO_URI = "mongodb://localhost:27017/web_web"; // Fjernet .users

// Funktion til at forbinde til MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Forbundet til MongoDB");
  } catch (err) {
    console.error("❌ MongoDB-forbindelsesfejl:", err);
    process.exit(1);
  }
};

// Generér fake brugerdata
const generateFakeUser = () => {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password({ length: 10 }), // Tilføjet password med min. 10 tegn
    createdAt: faker.date.past(),
  };
};

// Funktion til at indsætte faker-data i databasen
const seedDatabase = async (count: number = 10) => {
  try {
    await userModel.deleteMany({});
    console.log("🗑️ Eksisterende brugere slettet");

    const users = Array.from({ length: count }, generateFakeUser);
    await userModel.insertMany(users);

    console.log(`✅ ${count} fake brugere indsat i databasen`);
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Fejl ved indsættelse af faker-data:", error);
    mongoose.connection.close();
  }
};

// Kør scriptet, hvis filen køres direkte
if (require.main === module) {
  connectDB().then(() => seedDatabase(10));
}
