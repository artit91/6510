const fs = require("fs").promises;
const SCR2ISO_table = require("helper/scr2iso.json").map(n => Number(n));
const { C64 } = require("c64");

function SCR2ISO(buffer) {
  return String.fromCharCode(
    ...new Uint8Array(buffer).map(c => SCR2ISO_table[c])
  );
}

async function load(filename) {
  const file = await fs.readFile(filename);
  const c64 = new C64();
  c64.loadPRG(file);
  return c64;
}

module.exports = {
  SCR2ISO,
  load
};
