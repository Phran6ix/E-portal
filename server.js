const dotenv = require("dotenv");
const app = require("./app");
dotenv.config();

// Connect MongoDB
require("./db/db");

const port = process.env.PORT || 6000;

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
