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


  const courses = readJSONFile("Goldey-Beacom.json");
  const courses1 = readJSONFile("Goldey-Beacom1.json");

  const allCourses = [...courses, ...courses1]; 

  writeJSONFile("Final-Goldey-Beacom.json", allCourses);