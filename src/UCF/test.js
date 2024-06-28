import * as fs from "fs";

const readJSONFile = (filename) => {
  const data = fs.readFileSync(filename, "utf8");
  return JSON.parse(data);
};

const urls = readJSONFile("example.json");

console.log(urls);
