import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";
import appRoutes from "./routes";
import { errorHandler } from "./middlewares/errorHandler.middleware";

const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(morgan("dev"));

// API Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount Routes
app.use("/api/earnings", appRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`🚀 Earnings Service running on port ${PORT}`);
});
