const fs = require("fs");
const archiver = require("archiver");

const output = fs.createWriteStream("opapp.pkg");
var archive = archiver("zip");

output.on("close", function () {
  console.log("opapp.pkg generated successfully");
});

archive.on("error", function (err) {
  throw err;
});

archive.pipe(output);

// append files from a sub-directory, putting its contents at the root of archive
archive.directory("frontend/hbbtv/", false);
archive.finalize();
