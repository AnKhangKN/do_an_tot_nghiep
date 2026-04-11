require("module-alias/register");

const bodyParser = require("body-parser");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const routes = require("@/routes");
const errorHandler = require("./middlewares/error_handler.middleware");
const { FRONTEND_URL } = require("./config/env.config");

const app = express();

app.use(
    cors({
        origin: FRONTEND_URL,
        credentials: true,
    })
);
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api", routes);

app.use(errorHandler);

module.exports = app;
