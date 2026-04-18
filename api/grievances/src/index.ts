import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";
import appRoutes from "./routes";

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Setup Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount Routes
app.use("/api/grievances", appRoutes);

const PORT = process.env.PORT || 4004;
app.listen(PORT, () => {
  console.log(`🗣️ Grievance Service running on port ${PORT}`);
});
