const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

module.exports = app => {
  fs.readdir(__dirname, (err, files) => {
    files.forEach(item => {
      const itemPath = path.join(__dirname, item);
      const stats = fs.statSync(itemPath);
      if (stats.isDirectory()) {
        const router = express.Router();
        const controller = require(`./${item}`);
        controller.initController(router);
        app.use(`/api/${item}`, router);
      }
    });
  });
  app.use(bodyParser.json());
};
