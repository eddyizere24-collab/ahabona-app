'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ASSET_DIR = path.join(__dirname, 'assets');
function readAsset(name) {
  return fs.readFileSync(path.join(ASSET_DIR, name), 'utf8');
}

module.exports = Object.freeze({
  "index.html": readAsset("index.html"),
  "app.js": readAsset("app.js"),
  "admin.html": readAsset("admin.html"),
  "admin.js": readAsset("admin.js"),
  "legal.css": readAsset("legal.css"),
  "terms.html": readAsset("terms.html"),
  "privacy.html": readAsset("privacy.html"),
  "splash.js": readAsset("splash.js"),
  "sw.js": readAsset("sw.js")
});
