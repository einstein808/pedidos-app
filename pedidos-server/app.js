const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const ordersRoutes = require("./routes/orders");
const drinksRoutes = require("./routes/drinks");

const app = express();

app.use(bodyParser.json({ limit: "2mb" }));
app.use(cors());

app.use("/orders", ordersRoutes);
app.use("/drinks", drinksRoutes);

module.exports = app;
