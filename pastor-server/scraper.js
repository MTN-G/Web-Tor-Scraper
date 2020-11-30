const puppeteer = require('puppeteer');

module.exports = async function fetchAllPostsFromTor(url, initDate = 0) {
    try {
        const posts = []
        const browser = await puppeteer.launch({
            headless: false,
            args: ['--proxy-server=socks5://127.0.0.1:9050']
        });
    
        // http://nzxj65x32vh2fkhk.onion/all ---- the real page :)
    
        const page = await browser.newPage();
        await page.goto(url);
        await page.waitForSelector('div[class="col-sm-12"]');
        const postsElements = await page.$$('div[class="col-sm-12"]')
        const relevantPosts = postsElements.slice(1, postsElements.length - 1)
     
        for (let element of relevantPosts) {
    
                const titleElem = await element.$(':scope > div[class="pre-info pre-header"] > div > div > h4')
                const titleText = await titleElem.getProperty('innerText')
                const title = await titleText.jsonValue()
    
                const contentElem = await element.$(':scope > div[class="well well-sm well-white pre"]')
                const contentText = await contentElem.getProperty('innerText')
                const content = await contentText.jsonValue()
                    
                const footerElem = await element.$(':scope > div[class="pre-info pre-footer"]')
                const footerText = await footerElem.getProperty('innerText')
                const footerJson = await footerText.jsonValue()
                const footerArray = footerJson.toString().split(' at ');
                const author = footerArray[0].split(' by ')[1]  
                const date = footerArray[1].split(' UTC\nLanguage:')[0];
            
            if (new Date(date) > initDate) {
                posts.push(
                    {
                        Title: title.toString(),
                        Content: content.toString(),
                        Author: author,
                        Date: new Date(date),
                    });
            } else break;
        };
    
        await browser.close();
        console.log(posts, initDate)
        return posts
        
    } catch (error) {
        console.log(error.message)
        return initDate
    }
}


