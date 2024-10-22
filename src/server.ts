import dotenv from "dotenv";
dotenv.config(); // we are executing dotenv.config() to load the .env file
import mongoose from "mongoose";
import app from "./app";

mongoose
  .connect(process.env.MONGO_URL as string, {}) // connect to db
  .then((data) => {
    console.log("MongoDB connection succeed");
    const PORT = process.env.PORT ?? 3003;
    app.listen(PORT, function () {
      console.info(`The server is running successfully on port: ${PORT}`);
      console.info(`Admin project on http://localhost:${PORT}/admin \n`);
    });
  })
  .catch((err) => console.log("MongoDB connection failed", err));
