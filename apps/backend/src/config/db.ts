import { Sequelize } from "sequelize";

const sequelize = new Sequelize("postgresql://postgres:auth123$@db.encccsxtggutrnfnrkrd.supabase.co:5432/postgres", {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
      ssl: {
          require: true,
          rejectUnauthorized: false,
      },
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected");
  } catch (err:any) {
    console.error("Unable to connect to the database:", err.message);
    process.exit(1);
  }
};

export { sequelize, connectDB };
