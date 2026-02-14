const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const chalk = require("chalk");

const DBController = require("./db/mongoose");
const Util = require("./utils/util");
const morgan = require("./utils/morgan");

const app = express();

app.use(cors());
app.use(morgan.successHandler);
app.use(morgan.errorHandler);
app.use(
    express.urlencoded({
        extended: false,
        limit: "10mb",
        parameterLimit: 5000,
    }),
);
app.use(express.json({ limit: "10mb" }));

const routesPath = path.join(__dirname, "routes");
fs.readdirSync(routesPath).forEach((file) => {
    if (path.extname(file) === ".js") {
        app.use(require(path.join(routesPath, file)));
    }
});

app.get("/", (req, res) => {
    res.sendStatus(200);
});

DBController.initConnection(() => {
    const httpServer = require("http").createServer(app);
    httpServer.listen(process.env.PORT, () => {
        console.log(
            chalk.cyan.italic.underline(`Server running on ${Util.getBaseURL()}`),
        );
    });
});
