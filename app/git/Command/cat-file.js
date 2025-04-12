const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

class CatFileCommand {
  constructor(folder, file, commitSHA) {
    this.folder = folder;
    this.file = file;
    this.commitSHA = commitSHA;
  }

  execute() {
    const completePath = path.join(
      process.cwd(),
      ".git",
      "objects",
      this.folder,
      this.file
    );

    if (!fs.existsSync(completePath)) {
      throw new Error(`Not a valid object name ${this.commitSHA}`);
    }

    const fileContents = fs.readFileSync(completePath);
    const outputBuffer = zlib.inflateSync(fileContents);
    const output = outputBuffer.toString();

    process.stdout.write(output.split("\0")[1]); // Skip "blob <size>\0"
  }
}
