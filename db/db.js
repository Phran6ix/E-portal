const mongoose = require("mongoose");

const url = process.env.DATABASE.replace("<password>", process.env.DB_PASSWORD);

const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose
  .connect(url, connectionParams)
  .then(() => {
    console.log("Connection to Database success");
  })
  .catch((err) => {
    console.log(`Error in connecting to database ${err}`);
  });
