import { initHandModel } from "./models";
import { Sequelize } from "sequelize";

async function dbInit (): Promise<void> {
  const sequelize = new Sequelize("postgres://postgres:postgres@db/kanban-friends-server");

  // initUserModel(sequelize);
  initHandModel(sequelize);

  await sequelize.sync();
}

export default dbInit;
