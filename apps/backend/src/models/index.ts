import { sequelize } from "../config/db";
import User from "./user";
import Task from "./task";

const initModels = async () => {
  await sequelize.sync({ force: true }); // Use { force: true } only for development, it will drop tables if they exist
  console.log("Models synchronized");
};

export { initModels, User, Task };
