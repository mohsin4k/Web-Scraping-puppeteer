import * as fs from "fs";

// Function to read and parse a JSON file
const readJSONFile = (filename) => {
  const data = fs.readFileSync(filename, "utf8");
  return JSON.parse(data);
};

// Function to write a JSON file
const writeJSONFile = (filename, data) => {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2), "utf8");
};

// Read the JSON file
const courses = readJSONFile("NecCombined.json");

// Modify the JSON data
const modifiedCourses = courses.map((course) => {
  // Extract and rename the prerequisite attribute
  const { prerequisite, ...rest } = course;
  const prerequisites = prerequisite; // Renaming the attribute

  // Create a new object with the prerequisites attribute at the end
  return { ...rest, prerequisites };
});

// Write the modified data to a new file
writeJSONFile("FinalNecDetails.json", modifiedCourses);

console.log("JSON file has been modified and saved as FinalNecDetails.json");
