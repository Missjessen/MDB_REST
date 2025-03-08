import express, { Application } from "express";
import dotenvFlow from "dotenv-flow";
import uploadRoute from './uploadRoute';
import cors from "cors";  // Import CORS
import { testConnection } from "./repository/database";
import router from "./routes";
import { setupSwagger } from "./util/documentationSwag";


dotenvFlow.config();

// Create Express app
const app: Application = express();

// **Tilføj CORS Middleware**
function corsSetup() {
    
app.use(cors({
   // origin: "http://localhost:5173",  // Tillad requests fra din frontend
    origin: '*',  // Tillad requests fra din frontend
    methods: "GET,POST,PUT,DELETE,OPTIONS, HEAD", 
    allowedHeaders: ['Content-Type', 'Authorization', 'auth-token', 'Origin', 'X-Requested-With', 'Accept'],// **Tilføj auth-token**
    credentials: true
}))
};


// **Middleware**
app.use(express.json());


app.use('/api/upload', uploadRoute);

// Start server funktion
export function startServer() {
    testConnection();

    corsSetup(); 

    //  Håndter preflight requests
app.options("*", cors()); // **Gør, at serveren besvarer preflight requests korrekt**



// Middleware json parser

app.use(express.json()); // Aktiver JSON parsing i Express

    // Bind router to app
app.use("/api", router);

setupSwagger(app);

    const PORT: number = parseInt(process.env.PORT as string) || 4000;

    app.listen(PORT, function () {
        console.log("Server is running on port: " + PORT);
    });
}
