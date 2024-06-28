import puppeteer from "puppeteer";
import * as fs from "fs";

const startIndex = 7;
const finalIndex = 9;
let urls = [];

for (let i = startIndex; i <= finalIndex; i++) {
  let url = {
    loc: `https://catalog.nec.edu/content.php?catoid=41&catoid=41&navoid=1707&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&filter%5B3%5D=1&filter%5Bcpage%5D=${i}#acalog_template_course_filter`,
  };
  urls.push(url);
}

console.log(urls);

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}
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
    const excessPreSpaceMatch = prerequisite.match(excessSpacesRegexForPre);
    if (excessPreSpaceMatch) {
      prerequisite = prerequisite.slice(0, excessPreSpaceMatch.index).trim();
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
    prerequisite: prerequisite === null ? "" : prerequisite,
    min_hours: minCredit === maxCredit ? "0" : minCredit,
    max_hours: maxCredit,
  };
}
async function main() {
  let ParsedCourses = [];
  const browser = await puppeteer.launch({
    headless: false,
  });
  // process urls in batch in different tabs
  const noCourseUrls = [];
  const batch = 1;
  for (let i = 0; i < urls.length; i += batch) {
    console.log(
      "processing batch number",
      i,
      "to",
      i + batch,
      "of",
      urls.length,
      "urls"
    );
    const batchUrls = urls.slice(i, i + batch);
    const pages = await Promise.all(batchUrls.map((url) => browser.newPage()));
    await Promise.all(
      pages.map(async (page, index) => {
        await page.goto(batchUrls[index].loc);
        await page.setViewport({ width: 1280, height: 926 });

        await page.waitForSelector("table");
        const trs = await page.$$("table tr");
        for (let tr of trs) {
          const tds = await tr.$$("td.width");
          for (let td of tds) {
            const a = await td.$('a[aria-expanded="false"]');
            if (a) {
              try {
                await a.click();
                await delay(10);
              } catch (e) {
                console.error(e);
              }
            }
          }
        }
        console.log(
          "Clicked all codes now waiting for 15 seconds to load the content"
        );
        // once the clicks are done the accordion is expanded wait for around 60sec to load the content
        await delay(15000);
        console.log("60 seconds done");
        // there will be td tag is added with class coursepadding
        // inside the td tag there will div with no class inside div there will h3 tag for course title
        // and div content will be the course description
        const courseTds = await page.$$("table tr td.coursepadding");

        for (let courseTd of courseTds) {
          try {
            const courseTitleHead = await courseTd.$eval(
              "div h3",
              (h3) => h3.innerText
            );

            const firstIndex = courseTitleHead.indexOf("-");

            const id = courseTitleHead.substring(0, firstIndex).trim(); //course code

            const title = courseTitleHead.substring(firstIndex + 1).trim(); // course title

            const courseDescriptionAndCredit = await courseTd.$eval(
              "div h3",
              (div) => {
                const text = div.parentElement.innerText.trim();
                return {
                  text,
                };
              }
            );

            const Desctext1 = courseDescriptionAndCredit.text
              .substring(courseTitleHead.length + 1)
              .trim();

            const reqObj = parseCourseDescription(Desctext1);

            // const credits = Desctext1.split("Credits:")[1].trim();
            // const parts = credits.split(" ");
            // console.log(parts);
            // const indexCredits = credits.indexOf("to");
            // const min_hours =
            //   indexCredits > -1
            //     ? parseFloat(credits.split("to")[0]).toFixed(2)
            //     : "0.00";
            // const max_hours =
            //   indexCredits > -1
            //     ? parseFloat(credits.split("-")[1]).toFixed(2)
            //     : parseFloat(credits).toFixed(2);
            const catalog_year = "2023-2024";
            // const indexOfPrerequisite =
            //   courseDescriptionAndCredit.text.indexOf("\nPrerequisite(s):");
            // let prerequisites = "";
            // if (indexOfPrerequisite > -1) {
            //   prerequisites = courseDescriptionAndCredit.text
            //     .split("\nPrerequisite(s):")[1]
            //     .split("\n")[0]
            //     .trim();
            // }

            // const description = Desctext1.split("\n\n")[1].trim();
            const description = Desctext1;

            let a = {
              id,
              title,
              //   description,
              //   min_hours,
              //   max_hours,
              //   prerequisites,
              ...reqObj,
              catalog_year,
            };
            ParsedCourses.push(a);
          } catch (e) {
            console.error(e);
          }
        }
        return page;
      })
    );
    await Promise.all(pages.map((page) => page.close()));
  }

  fs.writeFileSync("./pima7-9.json", JSON.stringify(ParsedCourses, null, 2));
}

main()
  .then(() => console.log("done"))
  .catch(console.error);
