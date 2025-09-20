const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Starting BooksWagon scraper...');

  const url = 'https://www.bookswagon.com/book/white-nights-ronald-meyer-fyodor/9780241252086';
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🌐 Loading page...');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for key DOM content to load just in case
    // await page.waitForTimeout(3000);
    await new Promise(resolve => setTimeout(resolve, 3000));

    await page.screenshot({ path: 'bookswagon-debug.png', fullPage: true });
    console.log('📸 Screenshot saved as bookswagon-debug.png');

    // Get all JSON-LD blocks
    const jsonLdBlocks = await page.$$eval('script[type="application/ld+json"]', els =>
      els.map(el => el.innerText.trim())
    );

    console.log(`🔎 Found ${jsonLdBlocks.length} JSON-LD block(s)`);

    let productData = null;

    for (const block of jsonLdBlocks) {
  console.log('📋 Raw JSON-LD block:');
  console.log(block);
  try {
    // Try parsing as-is
    const parsed = JSON.parse(block);
    if (parsed['@type'] === 'Product') {
      productData = parsed;
      break;
    }
  } catch (err) {
    console.log('⚠️ JSON-LD parsing failed:', err.message);
  }
}


    if (productData) {
      const name = productData.name || 'N/A';
      const price = productData.offers?.price || 'N/A';
      console.log('✅ Product Data (from JSON-LD):');
      console.log(`   🏷️ Title: ${name}`);
      console.log(`   💰 Price: ₹${price}`);
    } else {
      console.log('❌ JSON-LD data not found or broken. Trying DOM fallback...');

      // Try to scrape directly from DOM
      const title = await page.$eval('h1#ctl00_phBody_ProductDetail_lblTitle', el => el.innerText.trim()).catch(() => null);
      const price = await page.$eval('span#ctl00_phBody_ProductDetail_lblourPrice', el => el.innerText.trim()).catch(() => null);

      if (title && price) {
        console.log('✅ Product Data (from DOM):');
        console.log(`   🏷️ Title: ${title}`);
        console.log(`   💰 Price: ${price}`);
      } else {
        console.log('❌ DOM fallback failed. Product info not found.');
      }
    }

  } catch (error) {
    console.error('❌ Scraping failed:', error.message);
  } finally {
    await browser.close();
    console.log('👋 Browser closed.');
  }
})();
