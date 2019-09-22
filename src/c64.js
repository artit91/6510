const fs = require("fs").promises;
const { C6510 } = require("6510");
const { Memory } = require("memory");

class C64 {
  constructor() {
    this.memory = new Memory();
    this.memory.stack = 0x0100;
    this.cpu = new C6510(this.memory);
  }
  loadPRG(buffer) {
    const position = buffer.readUInt16LE(0);
    this.memory.load(buffer.slice(2), position, buffer.length - 2);
  }
  async sys(address) {
    let cycles = 0;
    this.cpu.SP = 0xff;
    this.cpu.PC = address;
    return new Promise(resolve => {
      const loop = () => {
        const result = this.cpu.resume(1000);
        if (result <= 0) {
          return resolve(cycles - result);
        }
        cycles += result;
        process.nextTick(loop);
      };
      loop();
    });
  }
}

async function load(filename) {
  const file = await fs.readFile(filename);
  const c64 = new C64();
  c64.loadPRG(file);
  return c64;
}

module.exports = {
  C64,
  load
};
