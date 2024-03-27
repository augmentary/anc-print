import { chromium } from "playwright-extra";
import readline from 'readline/promises';
import stealth from "puppeteer-extra-plugin-stealth";

let browser;

export async function login(page) {
    if (!page) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        let username = process.env.ANCESTRY_USER ?? await rl.question('Enter Ancestry username: ');
        let password = process.env.ANCESTRY_PASSWORD ?? await rl.question('Enter Ancestry password: ');
        rl.close();

        chromium.use(stealth())
        browser = await chromium.launch({headless: false});
        const context = await browser.newContext();
        page = await context.newPage();

        await page.goto('https://www.ancestry.co.uk/account/signin');
        await page.waitForSelector('text=Reject all');
        await page.click('text=Reject all');

        await page.fill('text=Email', username);
        await page.fill('text=Password', password);
        await Promise.all([
            page.waitForNavigation(),
            page.click('#signInBtn'),
        ]);
    }

    return page;
}

export function close() {
    browser.close();
}