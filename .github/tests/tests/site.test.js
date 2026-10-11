
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("hotel website files exist", () => {
  for (const file of ["index.html", "style.css", "script.js"]) {
    assert.ok(fs.existsSync(file), `${file} should exist`);
  }
});

test("HTML includes CSS and JavaScript", () => {
  const html = fs.readFileSync("index.html", "utf8");

  assert.match(html, /style\.css/);
  assert.match(html, /script\.js/);
});

test("hotel booking form exists", () => {
  const html = fs.readFileSync("index.html", "utf8");

  assert.match(html, /booking-form/);
  assert.match(html, /checkin/);
  assert.match(html, /checkout/);
});
