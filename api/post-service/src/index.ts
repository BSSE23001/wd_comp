import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { clerkMiddleware } from "@clerk/express";
import { errorHandler } from "./middlewares/errorHandler.js";
import { swaggerDocs } from "./config/swagger.js";
import postRoutes from "./routes/post.routes.js";

const app = express();

// Security & Parsing
app.use(helmet());
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Clerk Initialization
app.use(clerkMiddleware());

// API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Health check (VERY IMPORTANT)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Routes
app.use("/api/posts", postRoutes);

// 404 Handler (MISSING BEFORE)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global Error Catcher
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📄 Swagger Docs available at http://localhost:${PORT}/api-docs`);
});
