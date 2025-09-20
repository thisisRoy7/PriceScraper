// scraper.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// A helper function to add a random delay
function delay(time) {
  return new Promise(function(resolve) { 
    setTimeout(resolve, time)
  });
}

async function scrapeAmazon(searchTerm, minPrice, maxPrice) {
  let browser;
  const scrapedData = [];

  console.log(`🚀 Starting the new 2-step scraper for "${searchTerm}"...`);

  try {
    browser = await puppeteer.launch({ headless: false, args: ['--start-maximized'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    // === STEP 1: Go to search page and collect all product links ===
    console.log('--- Step 1: Collecting product links from search results ---');
    // Using amazon.in as per your working code
    const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(searchTerm)}&low-price=${minPrice}&high-price=${maxPrice}`;
    
    console.log(`Navigating to: ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

    // Wait for the main results container to load
    await page.waitForSelector('[data-component-type="s-search-results"]', { timeout: 20000 });

    const productURLs = await page.$$eval(
      'div[data-component-type="s-search-result"] h2 > a',
      (links) => links.map(link => link.href)
    );

    console.log(`✅ Found ${productURLs.length} product links.`);

    // === STEP 2: Visit each product link and scrape its data ===
    console.log('--- Step 2: Visiting each link to scrape product details ---');
    for (const url of productURLs) {
      console.log(`\nNavigating to product page: ${url.substring(0, 50)}...`);
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        
        // Use selectors for the individual product page
        const titleSelector = '#productTitle';
        const priceSelector = 'span.a-price-whole'; // Your working selector!

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
        console.error(`  -> Failed to scrape data from ${url.substring(0, 50)}... Error: ${err.message}`);
      }
      
      // IMPORTANT: Add a random delay to appear more human-like
      const randomDelay = Math.floor(Math.random() * 2500) + 1000; // Delay between 1 and 3.5 seconds
      await delay(randomDelay);
    }
    
    return scrapedData;

  } catch (error) {
    console.error("❌ A critical error occurred:", error);
    return scrapedData; // Return any data that was successfully scraped before the error
  } finally {
    if (browser) {
      await browser.close();
      console.log("\nBrowser closed.");
    }
  }
}

// --- Main execution ---
const args = process.argv.slice(2); 
if (args.length !== 3) {
  console.error('❌ Incorrect arguments!');
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

scrapeAmazon(SEARCH_TERM, MIN_PRICE, MAX_PRICE).then((data) => {
  if (data.length > 0) {
    console.log("\n--- FINAL SCRAPED DATA ---");
    console.table(data);
  } else {
    console.log("\nNo data was scraped. The bot was likely blocked or no products were found.");
  }
});