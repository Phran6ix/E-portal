const dotenv = require("dotenv");
const app = require("./app");
dotenv.config();

// Connect MongoDB
const connectDB = require("./db/db");
const port = process.env.PORT || 6000;

async function boostrap() {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server running on ${port}`);
  });
}

boostrap();
