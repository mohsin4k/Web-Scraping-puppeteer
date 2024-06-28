import * as fs from "fs";

// Function to read and parse a JSON file
const readJSONFile = (filename) => {
  const data = fs.readFileSync(filename, "utf8");
  return JSON.parse(data);
};

// Read the content of the three JSON files
const file1 = readJSONFile("Nec1-3.json");
const file2 = readJSONFile("Nec4-6.json");
const file3 = readJSONFile("Nec7-9.json");

// Merge the arrays from the files
const mergedData = [...file1, ...file2, ...file3];

// Write the merged data to a new file
fs.writeFileSync(
  "NecCombined.json",
  JSON.stringify(mergedData, null, 2),
  "utf8"
);

console.log("JSON files have been merged into merged.json");
