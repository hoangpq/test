const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const {login, upload, sleep, studio_url} = require('./utils');

puppeteer.use(StealthPlugin());

const window_height = 1028;
const window_width = 1920;

// directory contains the videos you want to upload
const upload_file_directory = './upload/';

try {
    (async () => {
        const browser = await puppeteer.launch({
            headless: true,
            userDataDir: './test',
            ignoreDefaultArgs: [],
            autoClose: false,
            args: [
                '--disable-setuid-sandbox',
                // This will write shared memory files into /tmp instead of /dev/shm,
                // because Docker’s default for /dev/shm is 64MB
                '--disable-dev-shm-usage',
                '--lang=en-US,en',
                `--window-size=${window_width},${window_height}`,
                '--enable-audio-service-sandbox',
                '--no-sandbox',
                '--start-maximized'
            ],
        });

        let page = await browser.newPage();

        await page.setViewport({width: window_width, height: window_height});
        await page.goto(studio_url, {
            timeout: 20 * 1000,
            waitUntil: 'networkidle2',
        });

        if (await page.$('#identifierId')) {
            await login(page);
        }

        await sleep(5000);
        await upload(upload_file_directory, browser, window_height, window_height);

        await browser.close();
        console.log('Done');
    })();
} catch (error) {
    console.log(error);
}
