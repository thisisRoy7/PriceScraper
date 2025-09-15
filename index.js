const puppeteer = require('puppeteer');

async function scrape(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36');

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  } catch (error) {
    console.error(`Error navigating to ${url}: ${error.message}`);
    await browser.close();
    return { url, data: 'Could not load page' };
  }
  
  let data = 'Data not found';

  if (url.includes('croma.com')) {
    try {
      
      const priceSelector = 'span.amount';
      await page.waitForSelector(priceSelector, { timeout: 10000 });
      let priceText = await page.$eval(priceSelector, el => el.innerText.trim());
      
      data = priceText.includes('₹') ? priceText : `₹${priceText}`;
      
    } catch {
       console.error(`Could not find price for Croma URL: ${url}`);
    }
  } 
  else if (url.includes('amazon.in')) {
    try {
      // Selector for the product price on Amazon
      const priceSelector = 'span.a-price-whole';
      await page.waitForSelector(priceSelector, { timeout: 10000 });
      data = `₹${await page.$eval(priceSelector, el => el.innerText.trim().replace(/,$/, ''))}`;
    } catch {
      console.error(`Could not find price for Amazon URL: ${url}.`);
    }
  }

  await browser.close();
  return { url, data };
}

(async () => {
  const urls = process.argv.slice(2);
  if (urls.length === 0) {
    console.log("Please provide URLs as command-line arguments.");
    return;
  }
  
  const results = [];

  for (let url of urls) {
    console.log(`Scraping ${url}...`);
    const result = await scrape(url);
    results.push(result);
  }

  console.log('\n--- Scraping Results ---');
  results.forEach(r => console.log(`${r.url} → ${r.data}`));
})();
