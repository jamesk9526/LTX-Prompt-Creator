/**
 * Smoke test for Electron static server routing.
 * Verifies that exported Next assets and pages are reachable when served from ./out.
 */
const http = require('http');
const path = require('path');
const fs = require('fs');
const { startServer } = require('../electron/server');

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
  });
}

(async () => {
  try {
    const outDir = path.join(__dirname, '..', 'out');
    if (!fs.existsSync(outDir)) {
      console.error('❌ out/ directory not found. Run `npm run build` first.');
      process.exit(1);
    }

    const port = await startServer(3100, outDir);
    console.log(`ℹ️ Test server started on http://127.0.0.1:${port}`);

    // 1) Root page
    const root = await httpGet(`http://127.0.0.1:${port}/`);
    if (root.status !== 200) throw new Error(`Root GET failed: ${root.status}`);
    if (!/LTX Prompter Walkthrough/i.test(root.body)) throw new Error('Root page content mismatch');
    console.log('✅ Root page serves and contains expected title');

    // Extract a couple of static asset paths from HTML
    const assetMatches = Array.from(root.body.matchAll(/src="(\/[_]next\/static\/[^\"]+\.js)"/g)).map(m => m[1]).slice(0, 2);
    if (assetMatches.length === 0) throw new Error('No /_next static assets referenced on root');

    for (const asset of assetMatches) {
      const assetResp = await httpGet(`http://127.0.0.1:${port}${asset}`);
      if (assetResp.status !== 200) throw new Error(`Asset ${asset} not served: ${assetResp.status}`);
    }
    console.log('✅ /_next static assets resolve correctly');

    // 2) Wizard route
    const wiz = await httpGet(`http://127.0.0.1:${port}/wizard`);
    if (wiz.status !== 200) throw new Error(`/wizard GET failed: ${wiz.status}`);
    if (!/<html/i.test(wiz.body) || !/wizard/i.test(wiz.body)) throw new Error('Wizard page content not found');
    console.log('✅ /wizard resolves to wizard.html and serves correctly');

    // 3) Legacy route
    const legacy = await httpGet(`http://127.0.0.1:${port}/legacy`);
    if (legacy.status !== 200) throw new Error(`/legacy GET failed: ${legacy.status}`);
    if (!/Legacy/i.test(legacy.body)) console.warn('ℹ️ Legacy page did not contain expected marker (ok for minimal page)');
    console.log('✅ /legacy resolves successfully');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Static server routing smoke test PASSED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Static server routing smoke test FAILED');
    console.error(err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
