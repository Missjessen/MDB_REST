import cookieParser from 'cookie-parser';
import express, { Application } from "express";
import dotenvFlow from "dotenv-flow";
import cors from "cors";  
import { connect } from "./repository/database";
import router from "./routes";
import { setupSwagger } from "./util/documentationSwag";
import authRoutes from './routes/authRoutes';

import sheetsRoutes from './routes/sheetsRoutes';
import adRoutes from './routes/adRoutes';
import syncRouter from './routes/syncRoutes';



//import deployRoutes from './routes/deployRoutes';

import { generalLimiter } from './middleware/rateLimiter';





import dotenv from 'dotenv';
import campaignRouter from './routes/campaignDefsRoutes';
import keywordsRouter from './routes/keywordRoutes';
import campaignDefsRoutes from './routes/campaignDefsRoutes';
dotenv.config();


dotenvFlow.config();

// ======================== APP INITIALIZATION ========================
const app: Application = express();


// ======================== CORS SETUP ========================
// src/app.ts

// 1) Hent ALLOWED_ORIGINS fra .env
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

// 2) Byg server-origin (hvor Swagger UI kører)
const port = process.env.PORT || 4000;
const serverOrigin = `http://localhost:${port}`;

// 3) Sørg for at vores server-origin altid er tilladt
if (!allowedOrigins.includes(serverOrigin)) {
  allowedOrigins.push(serverOrigin);
}

// 4) Sæt CORS-middleware op
app.use(cors({
  origin(origin, callback) {
    // tillad Postman (ingen origin header), vores server‐origin og evt. andre fra env
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS‐fejl: Origin ${origin} ikke tilladt`));
    }
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','auth-token']
}));


// const allowedOrigins = 
// process.env.ALLOWED_ORIGINS?.split(',') || [];
  
//   app.use(cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error('CORS-fejl: Origin ikke tilladt'));
//       }
//     },
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'auth-token']
//   }));


// ======================== MIDDLEWARE SETUP ========================
app.use(generalLimiter); 

app.use(express.json());         
app.use(express.urlencoded({ extended: true })); 

// ======================== SERVER START ========================
// export function startServer() {
//     testConnection();

    // Handle preflight requests
    app.options("*", cors());

    // Route setup
    app.use(cookieParser()); // 🧠 Dette tilføjer req.cookies
    app.use("/api", router); 
    app.use('/auth', authRoutes);
  
    app.use('/api/sheets', sheetsRoutes);
    //app.use('/api/deploy', deployRoutes);

    app.use('/api/campaign-defs', campaignDefsRoutes);
    app.use('/api/ad-defs', adRoutes);
    app.use('/api/keyword-defs', keywordsRouter);

    app.use('/api/sheets/sync', syncRouter);
    


    // Swagger documentation
    setupSwagger(app);

  
    export default app;
