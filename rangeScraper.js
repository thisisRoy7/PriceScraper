/**
 * HOW TO RUN THIS SCRIPT:
 * 1. Make sure you have installed the required packages:
 * npm install puppeteer-extra puppeteer-extra-plugin-stealth csv-writer
 * 2. Run from your terminal with command-line arguments:
 * node rangeScraper.js "<Search Term>" <MinPrice> <MaxPrice>
 * 3. Example:
 * node rangeScraper.js "mechanical keyboard" 4000 10000
 * 4. The output will be saved to a file like "scraped_mechanical_keyboard.csv".
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// NEW: Import the csv-writer library
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

puppeteer.use(StealthPlugin());

// A helper function to add a random delay.
function delay(time) {
  return new Promise(function(resolve) { 
    setTimeout(resolve, time)
  });
}

async function scrapeAmazon(searchTerm, minPrice, maxPrice) {
  let browser;
  const scrapedData = [];

  console.log(` Starting the HUMAN-LIKE scraper for "${searchTerm}"...`);

  try {
    browser = await puppeteer.launch({
      headless: false, // Set to false to watch the browser in action.
      args: ['--start-maximized']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // === STEP 1: Mimic human navigation ===
    console.log('--- Step 1: Navigating and searching like a human ---');
    
    await page.goto('https://www.amazon.in', { waitUntil: 'domcontentloaded' });
    await delay(Math.random() * 2000 + 1000);

    const searchInputSelector = '#twotabsearchtextbox';
    await page.waitForSelector(searchInputSelector);
    await page.type(searchInputSelector, searchTerm, { delay: 150 });

    const searchButtonSelector = '#nav-search-submit-button';
    await page.hover(searchButtonSelector);
    await page.click(searchButtonSelector);

    await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

    const qid = Math.floor(Date.now() / 1000);
    const priceFilterUrl = `${page.url()}&low-price=${minPrice}&high-price=${maxPrice}&qid=${qid}&ref=sr_nr_p_36_0`;
    console.log('Applying price filter by navigating to:', priceFilterUrl);
    await page.goto(priceFilterUrl, { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('[data-component-type="s-search-results"]', { timeout: 20000 });
    await page.evaluate(() => { window.scrollBy(0, window.innerHeight * Math.random()); });
    await delay(1000);

    // === STEP 2: Collect all product links ===
    console.log('--- Step 2: Collecting product links with the LATEST selector ---');
    const productURLs = await page.$$eval(
      'div[data-component-type="s-search-result"] h2',
      (headings) => {
        const links = headings.map(h => h.closest('a')?.href);
        return links.filter(href => href && href.includes('/dp/'));
      }
    );

    console.log(`✅ Found ${productURLs.length} product links.`);

    // === STEP 3: Visit each link and scrape its data ===
    console.log('--- Step 3: Visiting each link to scrape product details ---');
    for (const url of productURLs) {
      console.log(`\nNavigating to product page: ${url.substring(0, 60)}...`);
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        
        const titleSelector = '#productTitle';
        const priceSelector = 'span.a-price-whole';

        await page.waitForSelector(titleSelector, { timeout: 10000 });
        await page.waitForSelector(priceSelector, { timeout: 10000 });

        const title = await page.$eval(titleSelector, el => el.innerText.trim());
        const price = await page.$eval(priceSelector, el => el.innerText.trim().replace(/[,.]/g, ''));
        
        scrapedData.push({
          title: title,
          price: `₹${price}`,
          link: url
        });
        console.log(`  -> Scraped: ${title.substring(0, 40)}...`);

      } catch (err) {
        console.error(`  -> Failed to scrape data from ${url.substring(0, 60)}... Error: ${err.message}`);
      }
      
      const randomDelay = Math.floor(Math.random() * 3000) + 1500;
      await delay(randomDelay);
    }
    
    return scrapedData;
    
  } catch (error) {
    console.error("❌ A critical error occurred:", error);
    return scrapedData;
  } finally {
    if (browser) {
      await browser.close();
      console.log("\nBrowser closed.");
    }
  }
}

// --- Function to save data to a CSV file ---
async function saveToCsv(data, searchTerm) {
  if (data.length === 0) {
    console.log("No data to save.");
    return;
  }

  const filename = `scraped_${searchTerm.replace(/\s+/g, '_')}.csv`;

  const csvWriter = createCsvWriter({
    path: filename,
    header: [
      { id: 'title', title: 'TITLE' },
      { id: 'price', title: 'PRICE' },
      { id: 'link', title: 'LINK' },
    ],
    // --- ALTERNATIVE FIX ---
    // Use UTF-16 Little Endian encoding, which some Excel versions handle better on double-click.
    encoding: 'utf16le',
  });

  try {
    await csvWriter.writeRecords(data);
    console.log(`\n✅ Success! Data saved to ${filename}`);
  } catch (error) {
    console.error("❌ Error writing to CSV:", error);
  }
}

// --- Main execution block (modified to call saveToCsv) ---
(async () => {
  const args = process.argv.slice(2); 

  if (args.length !== 3) {
    console.error('❌ Incorrect number of arguments!');
    console.log('Usage: node rangeScraper.js "<Search Term>" <MinPrice> <MaxPrice>');
    process.exit(1); 
  }

  const [SEARCH_TERM, MIN_PRICE_STR, MAX_PRICE_STR] = args;
  const MIN_PRICE = parseInt(MIN_PRICE_STR, 10);
  const MAX_PRICE = parseInt(MAX_PRICE_STR, 10);

  if (isNaN(MIN_PRICE) || isNaN(MAX_PRICE)) {
      console.error('❌ Error: Prices must be numbers.');
      process.exit(1);
  }

  const scrapedData = await scrapeAmazon(SEARCH_TERM, MIN_PRICE, MAX_PRICE);

  if (scrapedData.length > 0) {
    console.log("\n--- FINAL SCRAPED DATA ---");
    console.table(scrapedData);
    await saveToCsv(scrapedData, SEARCH_TERM); // Save the data
  } else {
    console.log("\nNo data was scraped. The bot was likely blocked or no products were found.");
  }
})();