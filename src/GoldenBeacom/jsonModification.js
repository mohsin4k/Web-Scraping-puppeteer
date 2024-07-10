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

function parseCourseInfo(courseString) {
    // Extract credits using regex
    const creditsMatch = courseString.match(/\((\d+)(?:-(\d+))? Credits?\)/);
  let minHours = "0.00";
  let maxHours = "0.00";

  if (creditsMatch) {
    if (creditsMatch[2]) {
      // If there's a range of credits
      minHours = parseFloat(creditsMatch[1]).toFixed(2);
      maxHours = parseFloat(creditsMatch[2]).toFixed(2);
    } else {
      // If there's a single credit value
      maxHours = parseFloat(creditsMatch[1]).toFixed(2);
    }
  }

  // Extract description
  let description = courseString
    .replace(/\(.*Credits?\)\s*/, '') // Remove credits part
    .replace(/\n\nPrerequisite\(s\):.*/, '') // Remove prerequisite part
    .trim();

  // Extract prerequisites
  const prerequisiteMatch = courseString.match(/Prerequisite\(s\):\s*(.+)/);
  let prerequisite = "";
  if (prerequisiteMatch) {
    prerequisite = prerequisiteMatch[1].trim();
  }

    const catalog_year = "2024-2025"
  
    return {
      description: description,
      min_hours: minHours,
      max_hours: maxHours,
      catalog_year,
      prerequisite: prerequisite
    };
  }

  const courses = readJSONFile("GoldenBeacon.json");

  const modifiedCourses = courses.map((course) => {
    // Extract and rename the prerequisite attribute
    const { id, title, description } = course;
    
    const reqObj = parseCourseInfo(description);
  
    // Create a new object with the prerequisites attribute at the end
    return { id, title, ...reqObj };
  });

  writeJSONFile("Goldey-Beacom.json", modifiedCourses);