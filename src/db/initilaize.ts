import { initHandModel } from "./models";
import { Sequelize } from "sequelize";

async function dbInit (): Promise<void> {
  const sequelize = new Sequelize(process.env.DB_URL || "sqlite::memory:");

  initHandModel(sequelize);

  await sequelize.sync();
}

export default dbInit;
