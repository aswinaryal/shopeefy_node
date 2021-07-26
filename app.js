const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");

const productRoutes = require("./routes/products");
const userRoutes = require("./routes/users");
const categoriesRoutes = require("./routes/categories");
const ordersRoutes = require("./routes/orders");

const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");
require("dotenv/config");
const api = process.env.API_URL;
app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authJwt());

app.use(`${api}/products`, productRoutes);
app.use(`${api}/users`, userRoutes);
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/orders`, ordersRoutes);

app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "shopeefyy"
  })
  .then((res) => {
    console.log("db connection succesfull");
  })
  .catch((err) => {
    console.log("could not connect to db ", err);
  });

app.listen(3000, () => {
  console.log("server listening on port 3000");
});
