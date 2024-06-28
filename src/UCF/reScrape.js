import puppeteer from "puppeteer";
import * as fs from "fs";

async function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

async function scrapePage(url, AllData) {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle2" });

    // Scrape the required data from the new page
    const data = await page.evaluate(async () => {
      // Replace the selector and logic to scrape the desired data
      await new Promise((resolve) => {
        setTimeout(resolve, 9000); // Adjust delay as needed for your case
      });

      const courseIdAndTitle = document.querySelector("h2").textContent;

      const parts = courseIdAndTitle.split(" - ").map((part) => part.trim());

      const divTags = document.querySelectorAll("div.noBreak");

      const results = { id: parts[0], title: parts[1] };

      divTags.forEach((div) => {
        const h3Text = div.querySelector("h3").textContent;

        const innerDivText = div.querySelector("div").textContent;

        if (h3Text === "Course Description") {
          results.description = innerDivText;
        } else if (h3Text === "Credits Hours") {
          results.min_hours = "0";
          results.max_hours = innerDivText;
          results.catalog_year = "2023-2024";
        } else if (h3Text === "Prerequisites") {
          results.prerequisites = innerDivText;
        }
      });

      return results;
    });

    AllData.push(data);
    return data;
    // console.log("Scraped data=> ", data);
  } catch (e) {
    console.error(`Error scraping ${url}:`, e);
  } finally {
    await browser.close();
  }
}

async function scrapeUrlsInBatches(urls) {
  for (let j = 0; j < urls.length; j++) {
    let urlObj = urls[j];
    console.log(`Processing batch ${urlObj.batchNumber}`);
    // for (let i = 0; i < urlObj.batchUrls.length; i++) {
    const AllData = [];
    await Promise.all(
      urlObj.batchUrls.map((obj) => scrapePage(obj.url, AllData))
    );

    fs.writeFileSync(
      `${urlObj.batchNumber}BatchData.json`,
      JSON.stringify(AllData, null, 2)
    );

    // Optionally, add a delay between batches
    await delay(1000);
    // }
  }
}
const readJSONFile = (filename) => {
  const data = fs.readFileSync(filename, "utf8");
  return JSON.parse(data);
};
const urls = readJSONFile("reScrape.json");

const batchSize = 2;

scrapeUrlsInBatches(urls)
  .then(() => {
    console.log("Scraping complete");
  })
  .catch((error) => {
    console.error("Error during scraping:", error);
  });
