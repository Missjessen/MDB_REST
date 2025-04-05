import express, { Application } from "express";
import dotenvFlow from "dotenv-flow";
import uploadRoute from "./uploadRoute"; 
import cors from "cors";  
import { testConnection } from "./repository/database";
import router from "./routes";
import { setupSwagger } from "./util/documentationSwag";
import authRoutes from './authRoutes';



//import dotenv from 'dotenv';
//dotenv.config();


dotenvFlow.config();

// ======================== APP INITIALIZATION ========================
const app: Application = express();

// ======================== CORS SETUP ========================
app.use(cors({
    origin: '*', 
    methods: "GET,POST,PUT,DELETE,OPTIONS,HEAD", 
    allowedHeaders: [
        'Content-Type', 'Authorization', 'auth-token', 
        'Origin', 'X-Requested-With', 'Accept'
    ],
    credentials: true
}));

// ======================== MIDDLEWARE SETUP ========================
app.use(express.json());         
app.use(express.urlencoded({ extended: true })); 
// Routes
/* app.use('/auth', authRoutes);
app.use('/api', router);
app.use('/api/auth', authRoutes); */
// ======================== SERVER START ========================
export function startServer() {
    testConnection();

    // Handle preflight requests
    app.options("*", cors());

    // Route setup
    app.use("/api", router);
    app.use("/api/upload", uploadRoute); 
    app.use('/auth', authRoutes);
    app.use('/api/google', router);
    app.use('/api/google', authRoutes);
   


   

    // Swagger documentation
    setupSwagger(app);

    // Port configuration
    const PORT: number = parseInt(process.env.PORT as string) || 4000;

    app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
}
