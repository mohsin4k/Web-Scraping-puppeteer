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
const courses = readJSONFile("UcfCombined.json");

// Modify the JSON data
//const modifiedCourses =

function rearrangeJson(courses) {
  return courses.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    min_hours: course.min_hours,
    max_hours: course.max_hours,
    catalog_year: course.catalog_year,
    prerequisites: course.prerequisites || "",
  }));
}

const modifiedCourses = rearrangeJson(courses);

// Write the modified data to a new file
writeJSONFile("FinalUcfDetails.json", modifiedCourses);

console.log("JSON file has been modified and saved as FinalNecDetails.json");
