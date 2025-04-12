const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const crypto = require("crypto");

const command = process.argv[2];

if (command === "cat-file" && process.argv[3] === "-p") {
  const hash = process.argv[4];
  const dir = hash.slice(0, 2);
  const file = hash.slice(2);
  const objectPath = path.join(".git", "objects", dir, file);

  if (!fs.existsSync(objectPath)) {
    throw new Error(`Not a valid object name ${hash}`);
  }

  const compressed = fs.readFileSync(objectPath);
  const decompressed = zlib.inflateSync(compressed);
  const content = decompressed.toString();

  // Remove header like "blob 123\0"
  const actualContent = content.slice(content.indexOf("\0") + 1);
  process.stdout.write(actualContent);
}
