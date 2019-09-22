const path = require("path");
const helper = require("helper");
const binPath = path.join(__dirname, "hello.prg");

test("hello output", async () => {
  const instance = await helper.load(binPath);

  await instance.sys(0xc000);

  expect(helper.SCR2ISO(instance.memory.slice(0x0400, 12))).toBe(
    "hello world!"
  );
});
