import puppeteer from "puppeteer";
import * as fs from "fs";

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

async function main() {

  const ParsedCourses = []; 

  const browser = await puppeteer.launch({
    headless: false,
  });

  try {
    const page= await browser.newPage();
    
    
    await page.goto(`https://catalog.gbc.edu/content.php?catoid=43&navoid=3240&p358=1#ent_courses358`, {timeout: '60000'});
    
    console.log("Came here");

    await page.setViewport({ width: 1280, height: 926 });

    await page.waitForSelector("table");

    await page.waitForSelector("ul");

    const uls = await page.$$("ul.program-list");

    for (let ul of uls) {
      const lis = await ul.$$("li");
      
      for (let li of lis) {
        const a = await li.$('a');
        // console.log("here=>", a);
        if (a) {
          // console.log("Inside");
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
      "Clicked all codes now waiting for 10 seconds to load the content with total a :"
    );
    await delay(20000);

    console.log("10 seconds done");

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

        const courseDescriptionAndCredit1 = await courseTd.$eval(
          "div h3",
          (div) => {
            const text = div.parentElement.innerText.trim();
            return {
              text,
            };
          }
        );

        const Desctext1 = courseDescriptionAndCredit1.text
          .substring(courseTitleHead.length + 1)
          .trim();

        // const reqObj = extractCourseInfo(Desctext1);

        // const newDesc = removeFirstNewlineAndAfter(courseDescriptionAndCredit.text);

        let a = {
          id,
          title,
          description: Desctext1, 
        };
        ParsedCourses.push(a);
      } catch (e) {
        console.error(e);
      }
    }

  } catch (error) {
    console.error(`Failed to navigate to:`, error);
  } 

  fs.writeFileSync("GoldenBeacon.json", JSON.stringify(ParsedCourses, null, 2));

  await browser.close();
}

main()
  .then(() => console.log("done"))
  .catch(console.error);
