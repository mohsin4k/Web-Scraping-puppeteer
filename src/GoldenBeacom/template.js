import puppeteer from "puppeteer";
import * as fs from "fs";

const startIndex = 1;
const finalIndex = 2;
let urls = [];

for (let i = startIndex; i <= finalIndex; i++) {
  let url = {
    loc: `https://catalog.gbc.edu/content.php?catoid=43&navoid=3240&p358=${i}#ent_courses358`,
  };
  urls.push(url);
}

console.log(urls);

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

async function main() {
  let ParsedCourses = [];
  const browser = await puppeteer.launch({
    headless: false,
  });
  // process urls in batch in different tabs
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

    // here What I am doing is processing multiple batches asynchronously. 
    await Promise.all(
      pages.map(async (page, index) => {
        // getting to that particular url 
        
        await page.goto(batchUrls[index].loc);
        
        console.log("Came here");

        await page.setViewport({ width: 1280, height: 926 });


        await page.waitForSelector("ul.program-list");

        await page.waitForSelector("li");

        const uls = await page.$$("ul.program-list");

        for (let ul of uls) {
          const lis = await ul.$$("li");
          for (let li of lis) {
            const a = await li.$('a[aria-expanded="false"]');
            if (a) {
                totalA++; 
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
          "Clicked all codes now waiting for 10 seconds to load the content with total a :", totalA
        );
        // once the clicks are done the accordion is expanded wait for around 60sec to load the content
        await delay(10000);
        
        console.log("10 seconds done");

        // there will be td tag is added with class coursepadding
        // inside the td tag there will div with no class inside div there will h3 tag for course title
        // and div content will be the course description
        // const courseTds = await page.$$("table tr td.coursepadding");

        // for (let courseTd of courseTds) {
        //   try {
        //     const courseTitleHead = await courseTd.$eval(
        //       "div h3",
        //       (h3) => h3.innerText
        //     );

        //     const firstIndex = courseTitleHead.indexOf("-");

        //     const id = courseTitleHead.substring(0, firstIndex).trim(); //course code

        //     const title = courseTitleHead.substring(firstIndex + 1).trim(); // course title

        //     const courseDescriptionAndCredit1 = await courseTd.$eval(
        //       "div h3",
        //       (div) => {
        //         const text = div.parentElement.innerText.trim();
        //         return {
        //           text,
        //         };
        //       }
        //     );

        //     const courseDescriptionAndCredit = await courseTd.$eval(
        //         "div h3",
        //         (div) => {
        //           // Remove all <strong> tags from the div
        //           const newDiv = div.parentElement;

        //           newDiv.querySelectorAll("strong").forEach((strong) => strong.remove());
              
        //           newDiv.querySelectorAll("h3").forEach((hthree) => hthree.remove());

        //           newDiv.querySelectorAll("a").forEach((aTags) => aTags.remove());

        //           newDiv.querySelectorAll("span").forEach((spanTags) => spanTags.remove());

        //           // Trim and return the innerText of the cleaned div
        //           const text = newDiv.innerText.trim();

        //           return {
        //             text,
        //           };
        //         }
        //       );

        //     const Desctext1 = courseDescriptionAndCredit1.text
        //       .substring(courseTitleHead.length + 1)
        //       .trim();

        //     const reqObj = extractCourseInfo(Desctext1);

        //     const newDesc = removeFirstNewlineAndAfter(courseDescriptionAndCredit.text);

        //     let a = {
        //       id,
        //       title,
        //       description: newDesc, 
        //       ...reqObj,
        //     };
        //     ParsedCourses.push(a);
        //   } catch (e) {
        //     console.error(e);
        //   }
        // }
        return page;
      })
    );
    await Promise.all(pages.map((page) => page.close()));
  }

    //   fs.writeFileSync("EasternGateway.json", JSON.stringify(ParsedCourses, null, 2));

  await browser.close();
}

main()
  .then(() => console.log("done"))
  .catch(console.error);
