// Load environment variables - HARUS DI BARIS PALING ATAS
import dotenv from 'dotenv';
dotenv.config();

// EXTRA DEBUG - Troubleshooting .env file
console.log('=== DEBUG ENVIRONMENT VARIABLES ===');
console.log('Current directory:', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL exists:', !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
console.log('GOOGLE_PRIVATE_KEY exists:', !!process.env.GOOGLE_PRIVATE_KEY);

// Coba baca file .env manual
import fs from 'fs';
import path from 'path';
try {
  const envPath = path.join(process.cwd(), '.env');
  console.log('Looking for .env at:', envPath);
  if (fs.existsSync(envPath)) {
    console.log('.env file exists');
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('.env file size:', envContent.length, 'characters');
    console.log('First 200 chars of .env:');
    console.log(envContent.substring(0, 200));
    
    // Check if file contains our variables
    const hasEmail = envContent.includes('GOOGLE_SERVICE_ACCOUNT_EMAIL');
    const hasPrivateKey = envContent.includes('GOOGLE_PRIVATE_KEY');
    console.log('Contains GOOGLE_SERVICE_ACCOUNT_EMAIL:', hasEmail);
    console.log('Contains GOOGLE_PRIVATE_KEY:', hasPrivateKey);
  } else {
    console.log('.env file NOT found at:', envPath);
    
    // List files in current directory to help debug
    console.log('Files in current directory:');
    try {
      const files = fs.readdirSync(process.cwd());
      files.forEach(file => {
        if (file.includes('env') || file.includes('.env')) {
          console.log('  ', file);
        }
      });
    } catch (err) {
      console.log('Error reading directory:', err);
    }
  }
} catch (error) {
  console.log('Error reading .env:', error);
}
console.log('====================================');

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { testGoogleSheetsConnection } from "./google-sheets";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Test Google Sheets connection on startup
  try {
    log("Testing Google Sheets connection...");
    const sheetsTest = await testGoogleSheetsConnection();
    log(`Google Sheets connection: ${sheetsTest ? "SUCCESS" : "FAILED"}`);
  } catch (error) {
    log("Google Sheets connection test failed:");
    console.error(error);
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // FIX: Changed port to 3000 and simplified listen for Windows compatibility
  const port = parseInt(process.env.PORT || '3000', 10);
  
  // Simplified server listen for Windows
  server.listen(port, () => {
    log(`Server running on http://localhost:${port}`);
    log(`WhatsApp Broadcast App ready!`);
    log(`Google Sheets: ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? "Configured" : "Not Configured"}`);
  });
})();