const config = require("./config/config");
const app = require("./express");
const mongoose = require("mongoose");
const template = require("./template");

app.listen(config.port, (err) => {
  if (err) {
    console.log(err);
  }
  console.info("Server started on port %s.", config.port);
});

app.get("/", (req, res) => {
  res.send(template());
});

mongoose.Promise = global.Promise;

mongoose
  .connect(config.mongoUri, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => {
    throw new Error(`Unable to connect to database: ${config.mongoUri}`);
    console.log(err);
  });
