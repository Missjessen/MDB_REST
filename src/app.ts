import express, { Application, Request, Response } from 'express';
import dotenvFlow from 'dotenv-flow';
import router from './routes';

dotenvFlow.config();

// Create Express app
const app: Application = express();

app.use('/api', router);


export function startServer() {

    const PORT: number = parseInt(process.env.PORT as string) || 4000; 
  
    // Start server
    app.listen(PORT, function() {
        console.log("Server is running on port:" + PORT);


    });
}



