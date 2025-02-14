import mongoose from "mongoose";

export async function testConnection() {
    try {
        await connect();
        await disconnect();
        console.log("Test connection successful");
        }
    
    catch (error) {
        console.log("Test connection failed. Error: " + error);
    }
}



export async function connect() {
    try {
        if (!process.env.DBHOST) {
            throw new Error("DBHOST not provided");
        }
        await mongoose.connect(process.env.DBHOST);

        if (mongoose.connection.db) {
            await mongoose.connection.db.admin().command({ ping: 1 });
            console.log("Connected to database");
        } 
        else {
            throw new Error("Error connecting to database");
        }


    } catch (error) {
console.log("Error connecting to database. Error: " + error);

}
}

export async function disconnect() {
    try {
        await mongoose.disconnect();
        console.log("Disconnected from database");
    } catch (error) {
        console.log("Error disconnecting from database. Error: " + error);
    }
}