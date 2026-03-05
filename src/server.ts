import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { logger } from "./config/logger";

const bootstrap = async () => {
  try {
    await connectDB();
    app.listen(env.port, () => logger.info(`API running on http://localhost:${env.port}`));
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};

void bootstrap();
