const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const crypto = require("crypto");

const command = process.argv[2];

switch (command) {
  case "init":
    createGitDirectory();
    break;

  case "hash-object":
    if (process.argv[3] === "-w" && process.argv[4]) {
      const filePath = process.argv[4];
      hashObject(filePath);
    } else {
      console.error("Usage: hash-object -w <file>");
    }
    break;

  case "cat-file":
    if (process.argv[3] === "-p" && process.argv[4]) {
      const hash = process.argv[4];
      catFile(hash);
    } else {
      console.error("Usage: cat-file -p <hash>");
    }
    break;

  default:
    throw new Error(`Unknown command ${command}`);
}

function createGitDirectory() {
  const gitPath = path.join(process.cwd(), ".git");
  fs.mkdirSync(path.join(gitPath, "objects"), { recursive: true });
  fs.mkdirSync(path.join(gitPath, "refs", "heads"), { recursive: true });
  fs.writeFileSync(path.join(gitPath, "HEAD"), "ref: refs/heads/main\n");
  console.log("Initialized git directory");
}

function hashObject(filePath) {
  const content = fs.readFileSync(filePath);
  const header = `blob ${content.length}\0`;
  const blob = Buffer.concat([Buffer.from(header), content]);
  const hash = crypto.createHash("sha1").update(blob).digest("hex");

  const dir = hash.slice(0, 2);
  const file = hash.slice(2);
  const objDir = path.join(".git", "objects", dir);
  const objPath = path.join(objDir, file);

  fs.mkdirSync(objDir, { recursive: true });
  fs.writeFileSync(objPath, zlib.deflateSync(blob));

  console.log(hash);
}

function catFile(hash) {
  const dir = hash.slice(0, 2);
  const file = hash.slice(2);
  const objectPath = path.join(".git", "objects", dir, file);

  if (!fs.existsSync(objectPath)) {
    throw new Error(`Not a valid object name ${hash}`);
  }

  const compressed = fs.readFileSync(objectPath);
  const decompressed = zlib.inflateSync(compressed);
  const result = decompressed.toString();
  const nullIndex = result.indexOf("\0");
  const content = result.slice(nullIndex + 1);

  process.stdout.write(content);
}
