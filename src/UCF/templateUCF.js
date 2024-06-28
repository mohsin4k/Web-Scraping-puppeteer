import puppeteer from "puppeteer";
import * as fs from "fs";

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

async function main(url) {
  const browser = await puppeteer.launch({
    headless: false,
  });
  // process urls in batch in different tabs

  const page = await browser.newPage();

  await page.goto(url);

  await page.setViewport({ width: 1280, height: 926 });

  await page.waitForSelector("div.style__groups___NnCy6");

  await page.waitForSelector("ul");

  const lis = await page.$$("ul li");

  for (let li of lis) {
    // const but = await page.$('ul li button[aria-expanded="false"]');
    const but = await li.$('button[aria-expanded="false"]');

    if (but) {
      try {
        await but.click();
        await delay(10);
      } catch (e) {
        console.error(e);
      }
    }
  }

  await page.waitForSelector("li.style__item___N3dlN");

  const reqLiTags = await page.$$("li.style__item___N3dlN");
  const AllHref = [];
  for (const li of reqLiTags) {
    // Get all <a> elements inside the current list item
    const aElements = await li.$$("a");

    // Iterate over each <a> element and get its text content
    for (const a of aElements) {
      //   const textContent = await page.evaluate(
      //     (element) => element.textContent.trim(),
      //     a
      //   );
      //   console.log("Text content=> ", textContent);

      const href = await page.evaluate((el) => el.href, a);
      //   console.log("Href=> ", href);

      // Open a new page and navigate to the link
      //const newPage = await browser.newPage();
      //await newPage.goto(href, { waitUntil: "networkidle2" });

      AllHref.push({ url: href });

      // Scrape the required data from the new page
      //const data = await newPage.evaluate(() => {
      // Replace the selector and logic to scrape the desired data
      //const req = document.querySelector("h2");
      //return req ? req.textContent : "";
      //});
      //console.log("Scraped data=> ", data);

      //await newPage.close();
    }
  }

  await browser.close();
  console.log(AllHref.length);
  fs.writeFileSync("AllUrl.json", JSON.stringify(AllHref, null, 2));
}

let url = "https://www.ucf.edu/catalog/undergraduate/#/courses";
await main(url)
  .then(() => console.log("done"))
  .catch(console.error);
