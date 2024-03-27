import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { login, close } from './lib/login.js';
import delay from './lib/delay.js';

(async () => {
  const content = await fs.promises.readFile('input.csv');
  const records = parse(content, { columns: true });

  let page = null;

  for (let record of records) {
    const fName = record.Code.replaceAll(/\/|\?/g,'-');
    const path = `out/${record.Tree_ID}/${fName}.pdf`;
    if (fs.existsSync(path)) {
      continue;
    }

    page = await login(page);

    await page.goto(`https://www.ancestry.co.uk/family-tree/person/tree/${record.Tree_ID}/person/${record.Person_ID}/facts`);
    //await page.click('.pageNav .iconPrint');
    await page.click('.pageActions .iconTools');
    await page.click('.researchToolsList .iconPrint');

    await page.evaluate(async () => {
      document.getElementsByTagName('html')[0].classList.add('pFShowingNotes', 'pFShowingSiblings', 'pFShowingTags', 'pFShowingComments');
    });

    // await page.click('#printFriendlyCustomizeBtn');
    //
    // const rows = page.locator('.printOptionsMenu button[aria-checked=false]:visible');
    // const count = await rows.count();
    // for (let i = 0; i < count; ++i) {
    //   await rows.nth(i).click();
    // }

    let content = await page.pdf({
      format: 'A4',
    });
    fs.mkdirSync(`out/${record.Tree_ID}`, {recursive: true})
    fs.writeFile(path, content, function(err) {
      if(err) {
        return console.log(err);
      }
      console.log(`Wrote ${path}`);
    });

    await delay(1000 + (500 * Math.random()));
  }

  close();
})();