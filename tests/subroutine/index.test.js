const path = require("path");
const helper = require("helper");
const binPath = path.join(__dirname, "subroutine.prg");

test("subroutine output", async () => {
  const instance = await helper.load(binPath);

  const time = process.hrtime();
  const cycles = await instance.sys(0xc000);
  const diff = process.hrtime(time);

  console.log(`It took ${cycles} cycles`);
  console.log(`It took ${diff[0] * 1e9 + diff[1]} nanoseconds`);
  console.log(`It took ${(diff[0] * 1e9 + diff[1]) / 1e6} milliseconds`);

  expect(helper.SCR2ISO(instance.memory.slice(0x0400, 12))).toBe(
    "hello world!"
  );
});
