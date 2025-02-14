import express, { Application, Request, Response } from 'express';
import dotenvFlow from 'dotenv-flow';
import { testConnection } from './repository/database';
import router from './routes';

dotenvFlow.config();

// Create Express app
const app: Application = express();




export function startServer() {
  // Middleware json parser
    app.use(express.json());
     //bind router to app
    app.use('/api', router);

    testConnection();

    const PORT: number = parseInt(process.env.PORT as string) || 4000; 
  
    // Start server
    app.listen(PORT, function() {
        console.log("Server is running on port:" + PORT);


    });
}



