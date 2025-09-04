const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('http://localhost:3002');
  
  console.log('Chang Cookbook dev site opened in browser');
  console.log('Press Ctrl+C to close the browser');
  
  // Keep the browser open until interrupted
  process.on('SIGINT', async () => {
    await browser.close();
    process.exit(0);
  });
  
  // Keep the process alive
  await new Promise(() => {});
})();