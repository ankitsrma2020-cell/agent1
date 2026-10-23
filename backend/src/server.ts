import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import dns from "node:dns";
import authRoutes from "./routes/authRoutes.js";


dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json({ limit: "3mb" }));
app.use("/api/auth", authRoutes);

app.get("/api/health", (_request, response) => {
  response.json({
    success: true,
    message: "Backend is running",
  });
});

app.use("/api", (_request, response) => {
  response.status(404).json({
    success: false,
    message: "API endpoint not found.",
  });
});

app.use((error: unknown, _request: express.Request, response: express.Response, next: express.NextFunction) => {
  if (response.headersSent) return next(error);

  const status = typeof error === "object" && error !== null && "status" in error && typeof error.status === "number"
    ? error.status
    : 500;
  const message = status === 413
    ? "Request payload is too large."
    : "Unable to process API request.";

  console.error("API request failed:", error);
  return response.status(status).json({ success: false, message });
});

mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(port, () => {
      console.log(`Backend listening on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });
