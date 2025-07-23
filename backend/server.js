const app = require("./app");
const connectDB = require("./src/config/database.config");

connectDB()
  .then(() => {
    app.listen(process.env.PORT, (err) => {
      if (err) {
        console.log(`Error while starting server`, err);
        process.exit(1); // close the server/process with failure
      }
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error while connecting to database", err);
    process.exit(1); // close the server/process with failure
  });

// https://github.com/sarvesh-1999
// https://github.com/Sarvesh-1999/ReactProject-1-30
