// src/repository/database.ts
import mongoose from 'mongoose';

export async function connect() {
    if (!process.env.DBHOST) throw new Error('DBHOST not provided');
    await mongoose.connect(process.env.DBHOST);
    await mongoose.connection.db!.admin().command({ ping: 1 });
    console.log('✔️ Connected to MongoDB');
  }


// export async function testConnection() {
//   try {
//     await connect();
//     await disconnect();
//     console.log("Test connection successful");
//   } catch (error) {
//     console.error("Test connection failed. Error:", error);
//   }
// }

// export async function connect() {
//     if (!process.env.DBHOST) {
//       throw new Error("DBHOST not provided");
//     }
//     await mongoose.connect(process.env.DBHOST);
//     await mongoose.connection.db!.admin().command({ ping: 1 });
//     console.log("✔️ Connected to MongoDB");
//   }
  
  export async function disconnect() {
    await mongoose.disconnect();
    console.log("🛑 Disconnected from MongoDB");
  }

// til scripts og engangs-jobs, ikke HTTP
export async function withDatabase<T>(operation: () => Promise<T>): Promise<T> {
  try {
    await connect();
    return await operation();
  } finally {
    await disconnect();
  }
}

// import mongoose from "mongoose";

// export async function testConnection() {
//     try {
//         await connect();
//         await disconnect();
//         console.log("Test connection successful");
//         }
    
//     catch (error) {
//         console.log("Test connection failed. Error: " + error);
//     }
// }




// export async function connect() {
//     try {
//         if (!process.env.DBHOST) {
//             throw new Error("DBHOST not provided");
//         }
//         await mongoose.connect(process.env.DBHOST);

//         if (mongoose.connection.db) {
//             await mongoose.connection.db.admin().command({ ping: 1 });
//             //console.log("Connected to database");
//         } 
//         else {
//             throw new Error("Error connecting to database");
//         }


//     } catch (error) {
// console.log("Error connecting to database. Error: " + error);

// }
// }

// export async function disconnect() {
//     try {
//         await mongoose.disconnect();
//         //console.log("Disconnected from database");
//     } catch (error) {
//         console.log("Error disconnecting from database. Error: " + error);
//     }
// }

// export async function withDatabase<T>(operation: () => Promise<T>): Promise<T | null> {
//     try {
//         await connect();
//         const result = await operation();
//         return result;
//     } catch (error) {
//         console.error("❌ Fejl under databaseoperation:", error);
//         return null;
//     } finally {
//         await disconnect();
//     }
// }