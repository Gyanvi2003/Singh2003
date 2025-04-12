const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const crypto = require("crypto");

// Debug: show all command-line args
console.log("Full args:", process.argv);

const command = process.argv[2]?.trim(); // trim in case of extra spaces or \r

// More debug info
console.log("DEBUG: Raw command =", process.argv[2]);
console.log("DEBUG: Trimmed command =", command);
console.log("DEBUG: Type of command =", typeof command);

switch (command) {
  case "init":
    console.log("Command matched: init");
    createGitDirectory();
    break;

  case "hash-object":
    console.log("Command matched: hash-object");
    const writeFlag = process.argv[3];
    const filePath = process.argv[4];
    if (writeFlag === "-w" && filePath) {
      hashObject(filePath);
    } else {
      console.error("Usage: hash-object -w <file>");
    }
    break;

  default:
    console.log("Command not recognized, throwing error.");
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

  const dir = hash.substring(0, 2);
  const file = hash.substring(2);
  const objPath = path.join(".git", "objects", dir);
  const objFile = path.join(objPath, file);

  fs.mkdirSync(objPath, { recursive: true });
  fs.writeFileSync(objFile, zlib.deflateSync(blob));

  console.log(hash);
}
