import cookieParser from 'cookie-parser';
import express, { Application } from "express";
import dotenvFlow from "dotenv-flow";
import cors from "cors";  
import { testConnection } from "./repository/database";
import router from "./routes";
import { setupSwagger } from "./util/documentationSwag";
import authRoutes from './routes/authRoutes';
import adsRoutes from './routes/adsRoutes';
import sheetsRoutes from './routes/sheetsRoutes';




import dotenv from 'dotenv';
dotenv.config();


dotenvFlow.config();

// ======================== APP INITIALIZATION ========================
const app: Application = express();

// ======================== CORS SETUP ========================
const allowedOrigins = 
process.env.ALLOWED_ORIGINS?.split(',') || [];
  
  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS-fejl: Origin ikke tilladt'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'auth-token']
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
    app.use(cookieParser()); // 🧠 Dette tilføjer req.cookies
    app.use("/api", router); 
    app.use('/api/auth', authRoutes);
    app.use('/api/ads', adsRoutes);
    app.use('/api/sheets', sheetsRoutes);
   
   

   

    // Swagger documentation
    setupSwagger(app);

    // Port configuration
    const PORT: number = parseInt(process.env.PORT as string) || 4000;

    app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
}
