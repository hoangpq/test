const fs = require('fs');
const path = require('path');

const title_prefix = 'video title prefix ';
const video_description = '';

const USERNAME = '<>';
const PASSWORD = '<>';

const studio_url = 'https://studio.youtube.com/';

module.exports.studio_url = studio_url;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports.sleep = sleep;

async function login(page) {
    console.log('Try to login!!');

    let badInput = true;

    while (badInput) {
        await page.type('#identifierId', USERNAME);
        await sleep(1000);

        await page.keyboard.press('Enter');
        await sleep(1000);

        badInput = await page.evaluate(
            () =>
                Boolean(document.querySelector('#identifierId[aria-invalid="true"]'))
        );
        if (badInput) {
            console.log('Incorrect email or phone. Please try again.');
            await page.click('#identifierId', {clickCount: 3});
        }
    }

    await page.type('[name="password"]', PASSWORD);
    await sleep(1000);

    await page.keyboard.press('Enter');
    await sleep(15000);
}

module.exports.login = login;

module.exports.upload =  function upload(upload_path, browser, w_width, w_height) {
    let files = [];

    try {
        const temp_files = fs.readdirSync(path.resolve(__dirname, upload_path));
        for (let i = 0; i < temp_files.length; i++) {
            files.push(temp_files[i]);
        }
    } catch (e) {
        console.error(e.message);
    }


    for (let i = 0; i < files.length; i++) {
        const page = await browser.newPage();

        await page.setViewport({width: w_width, height: w_height});
        await page.goto(studio_url, {
            timeout: 20000,
            waitUntil: 'networkidle2',
        });

        try {
            const file_name = files[i];
            console.log('now process file:\t' + file_name);

            // click create icon
            await page.click('#create-icon');

            // click upload video
            await page.click('#text-item-0 > ytcp-ve');
            await sleep(500);

            // click select files button and upload file
            const [fileChooser] = await Promise.all([
                page.waitForFileChooser(),
                page.click('#select-files-button > div'), // some button that triggers file selection
            ]);

            await fileChooser.accept([upload_path + file_name]);

            // wait 10 seconds
            await sleep(10_000);

            // title content
            const text_box = await page.$x('//*[@id="textbox"]');
            await text_box[0].type(title_prefix + file_name.replace('.mp4', ''));

            await sleep(1_000);

            // add description
            await text_box[1].type(video_description);

            let flag = false;
            let count = 0;

            do {
                try {
                    await sleep(5_000);
                    await page.click('#next-button');
                    count++;
                    flag = true;
                } catch (e) {
                    console.error(e.message);
                }
            } while (!flag);

            console.log(`Retry: ${count > 1 ? count - 1 : 0}`);
            await sleep(2_000);

            // not make for kids
            await page.click("[name='NOT_MADE_FOR_KIDS'] [role='none']");
            await sleep(2_000);
            // next step
            await page.click('#next-button');
            await sleep(5_000);
            // next step
            await page.click('#next-button');
            await sleep(5_000);
            // next step
            await page.click('#next-button');
            await sleep(5_000);
            // make video unlisted
            await page.click("[name='UNLISTED']");
            await sleep(3_000);
            await page.click('#done-button');

            // wait 60 seconds
            await sleep(60 * 1000);

            await page.close();

        } catch (e) {
            console.log(e);
        }
    }
};
