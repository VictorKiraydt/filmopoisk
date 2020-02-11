const express = require("express");
const app = express();
const initApi = require("./controllers");
const config = require("config");

const PORT = config.get("server.port");

initApi(app);
app.listen(PORT, () => console.log(`App has been started on port ${PORT}...`));
