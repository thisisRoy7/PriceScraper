# ⚙️ Web Scraper for Price Comparison

This is a simple yet powerful web scraper built with Node.js and Puppeteer. It automatically extracts product prices from e-commerce websites like Amazon and Croma and saves the results to a CSV file for easy analysis.

## 🚧 Project Status
> **Note:** This project is a work in progress and is actively updated on a daily basis. New features and bug fixes are added frequently.

## ✨ Features

* **Multi-Site Scraping:** Extracts data from Amazon India and Croma.
* **Data Export:** Saves all scraped data to a single `results.csv` file.
* **Data Persistence:** Appends new results to the CSV file on each run, preserving all historical data.
* **Headless Operation:** Runs in the background without opening a visible browser window.
* **Robust Navigation:** Intelligently waits for dynamic content to load before extracting data.

## 🛠️ Setup and Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (version 16 or later)
* npm (comes with Node.js)

### Installation
1.  **Clone the repository** (or download the files):
    ```bash
    git clone [https://github.com/YourUsername/YourRepositoryName.git](https://github.com/YourUsername/YourRepositoryName.git)
    cd YourRepositoryName
    ```

2.  **Install the necessary packages**:
    ```bash
    npm install puppeteer json2csv
    ```

## 🚀 How to Use

You can run the scraper directly from your terminal.

1.  **Find the URLs** of the products you want to compare on `amazon.in` and `croma.com`.

2.  **Run the script** with the URLs as command-line arguments. Enclose each URL in double quotes.

    **Example:**
    ```bash
    node index.js "[https://www.amazon.in/](https://www.amazon.in/)..." "[https://www.croma.com/](https://www.croma.com/)..."
    ```

3.  **Check the output:**
    * The scraped data will be printed to your console.
    * A file named `results.csv` will be created or updated in your project folder with the scraped data.



## ⚠️ Troubleshooting

The most common issue with any web scraper is when a website changes its HTML structure, causing the CSS selectors to become outdated.

If the script fails to find data for a site, you will need to:
1.  Open the product page in your browser.
2.  Use the "Inspect" tool to find the new CSS selector for the price element.
3.  Update the `priceSelector` variable for the corresponding site in the `index.js` file.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page or submit a pull request.

---
_This project is for educational purposes only. Please be respectful of the websites you scrape and their terms of service._
