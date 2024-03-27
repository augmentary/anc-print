import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { login, close } from './lib/login.js';
import delay from './lib/delay.js';

const TREE_ID = 'xxxxx';

(async () => {
  const content = await fs.promises.readFile('missing_tags.csv');
  const records = parse(content, { columns: true });

  let page = null;

  let first = true;

  for (let record of records) {
    page = await login(page);

    await page.goto(`https://www.ancestry.co.uk/family-tree/person/tree/${TREE_ID}/person/${record.Person_ID}/facts`);

    // the sidebar tab/open state is sticky across page loads - we could muck about detecting it and fix it, or we could
    // just manually open it on the first page and continue from there
    if (first) {
      await page.pause();
      first = false;
    }

    // if(!await page.isVisible('text=Create a custom tag')) {
    //   await page.click('[aria-label="Edit tags"]');
    //   await page.click('.sidebarFooter #editBtn');
    //   await page.click('#CustomTagsBtn');
    // }

    await page.click(`#CustomTagsContent .tagItemUnselected.isCustomTag >> text="${record.Generation}"`);

    console.log(`Updated ${record.Forename} ${record.Surname} with generation ${record.Generation}`);

    await delay(1000 + (500 * Math.random()));
  }

  close();
})();