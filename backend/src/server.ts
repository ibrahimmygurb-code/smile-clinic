import "dotenv/config";
import cors from "cors";
import express from "express";
import { seedAdminUser } from "./lib/auth";
import { seedDoctors } from "./lib/doctors-store";
import { seedServices } from "./lib/services-store";
import { authRouter } from "./routes/auth";
import { apiRouter } from "./routes/api";

const app = express();
const port = Number(process.env.PORT) || 4000;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(
  cors({
    origin: [frontendUrl, "http://localhost:3000", "http://localhost:3001"],
  }),
);
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api", apiRouter);

app.listen(port, async () => {
  try {
    await seedDoctors();
    await seedServices();
    await seedAdminUser();
  } catch (error) {
    console.error("Could not seed initial data:", error);
  }
  console.log(`Backend running on http://localhost:${port}`);
});
