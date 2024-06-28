import { scrape } from "./test.js";

for (let i = 1; i <= 1; i++) {
  let url = `https://catalog.nec.edu/content.php?catoid=41&catoid=41&navoid=1707&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&filter%5B3%5D=1&filter%5Bcpage%5D=${i}#acalog_template_course_filter`;

  await scrape(url, i);
}
