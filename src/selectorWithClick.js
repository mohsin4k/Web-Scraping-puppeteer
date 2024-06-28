import puppeteer from "puppeteer";
import fs from "fs/promises";

(async () => {
  try {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({
      headless: false,
      devtools: true,
    });
    const page = await browser.newPage();

    // Navigate the page to a URL
    await page.goto(
      "https://catalog.nec.edu/content.php?catoid=41&navoid=1707"
    );

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });

    //Here I am clicking all the links beforehand so that all the required elements are present in DOM
    await page.$$eval("td.width", async (tds) => {
      for (let td of tds) {
        const aElements = td.querySelectorAll("a");

        for (let a of aElements) {
          await new Promise((resolve) => {
            a.addEventListener("click", resolve, { once: true });
            a.click();
          });
        }
      }
    });

    //This time delay is being injected because even progmatically all the links are being clicked but in browser takes it time for rendering the dom
    await page.evaluate(
      () => new Promise((resolve) => setTimeout(resolve, 15000))
    );

    //This is the main page evaluation
    const h3Sel = await page.evaluate(() => {
      // This function is to modify the extracted scraped data from browser and get all the required attributes
      function parseCourseDescription(inputString) {
        // Define regular expressions to match "Prerequisite(s)", "Credits", extra spaces and some customization
        const prerequisiteRegex = /Prerequisites?: (.+?)(?=\s+Credits:|\s*$)/;
        const creditsRegex = /Credits: (\d+)(?:\s+to\s+(\d+))?/;
        const excessSpacesRegex = /\s{3,}/;
        const excessSpacesRegexForPre = /\s{2,}/;

        // Extract the prerequisite and credits using the regex
        const prerequisiteMatch = inputString.match(prerequisiteRegex);
        const creditsMatch = inputString.match(creditsRegex);

        let description, prerequisite, minCredit, maxCredit;

        // Extract and trim the description
        if (prerequisiteMatch) {
          description = inputString.slice(0, prerequisiteMatch.index).trim();
        } else if (creditsMatch) {
          description = inputString.slice(0, creditsMatch.index).trim();
        } else {
          description = inputString.trim();
        }

        // Check for more than 3 consecutive spaces and truncate if found
        const excessSpacesMatch = description.match(excessSpacesRegex);
        if (excessSpacesMatch) {
          description = description.slice(0, excessSpacesMatch.index).trim();
        }

        // Extract prerequisite if it exists
        prerequisite = prerequisiteMatch ? prerequisiteMatch[1].trim() : null;

        //Below code is to exactly get the prerequisite in a way we want them like trimming all the extra spaces and removing unwanted characters, etc.
        if (prerequisite !== null) {
          const excessPreSpaceMatch = prerequisite.match(
            excessSpacesRegexForPre
          );
          if (excessPreSpaceMatch) {
            prerequisite = prerequisite
              .slice(0, excessPreSpaceMatch.index)
              .trim();
          }
          prerequisite = prerequisite.replace(/\s*\.\s*$/, "").trim();
        }

        // Extract credits if it exists
        if (creditsMatch) {
          minCredit = creditsMatch[1].trim();
          maxCredit = creditsMatch[2] ? creditsMatch[2].trim() : minCredit;
        }

        return {
          description,
          prerequisite,
          min_hours: minCredit === maxCredit ? 0 : minCredit,
          max_hours: maxCredit,
        };
      }

      const allDesc = [];
      const h3ele = document.querySelectorAll("h3");
      for (ele of h3ele) {
        const courseTitleAndId = ele.textContent.trim();
        const parentDiv = ele.parentElement;
        const cloneDiv = parentDiv.cloneNode(true);

        // Remove the h3 element from the cloned div
        const h3Clone = cloneDiv.querySelector("h3");
        if (h3Clone) {
          h3Clone.remove();
        }
        const parentText = cloneDiv.textContent.trim();
        const parts = courseTitleAndId.split(" - ");

        const remainingObj = parseCourseDescription(parentText);

        allDesc.push({
          id: parts[0].trim(),
          title: parts[1].trim(),
          ...remainingObj,
          catalog_year: "2023-2024",
        });
      }
      return allDesc;
    });

    //logging the data for testing
    console.log(h3Sel);

    const jsonData = JSON.stringify(h3Sel, null, 2);

    // Write JSON string to file
    await fs.writeFile("courses.json", jsonData);
    console.log("Data has been written to courses.json");

    await browser.close();
  } catch (err) {
    console.log(err);
  }
})();
