import puppeteer from "puppeteer";
import * as fs from "fs";

const readJSONFile = (filename) => {
  const data = fs.readFileSync(filename, "utf8");
  return JSON.parse(data);
};
const urls = readJSONFile("AllUrl.json");

console.log(urls.length);

// const batchArray = [];

// for (let i = 0; i < 2635; i += 5) {
//   const batch = urls.slice(i, i + 5);
//   batchArray.push(batch);
// }

// const reqBatch = [];

// for (let i = 1; i < 528; i++) {
//   const courseDetails = readJSONFile(`${i}BatchData.json`);
//   //   console.log(courseDetails.length);
//   if (courseDetails.length < 5) {
//     reqBatch.push({ batchNumber: i, batchUrls: batchArray[i - 1] });
//   }
// }

// fs.writeFileSync(`reScrape.json`, JSON.stringify(reqBatch, null, 2));

// console.log(reqBatch.length);
