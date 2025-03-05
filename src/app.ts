import express, { Application, Request, Response } from "express";
import dotenvFlow from "dotenv-flow";
import multer from "multer";
import path from "path";
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
app.use(express.urlencoded({ extended: true }));

// **Multer konfiguration til filupload**
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// **Endpoint til billedupload**
app.post('/upload', upload.single('image'), async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    res.json({ imageUrl: `/uploads/${req.file.filename}` });
  });

// **Gør uploads-mappen offentligt tilgængelig**
app.use('/uploads', express.static('uploads'));



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
