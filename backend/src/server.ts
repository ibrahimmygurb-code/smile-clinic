import "dotenv/config";
import { createApp } from "./app";
import { seedAdminUser } from "./lib/auth";
import { seedDoctors } from "./lib/doctors-store";
import { seedServices } from "./lib/services-store";

const app = createApp();
const port = Number(process.env.PORT) || 4000;

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
