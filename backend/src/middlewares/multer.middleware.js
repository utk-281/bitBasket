const multer = require("multer");

let myStorage = multer.memoryStorage();

let upload = multer({ storage: myStorage });

module.exports = upload;
