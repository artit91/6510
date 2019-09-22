const operations = new Map([
  [
    0xa2,
    function ldx_i(cpu) {
      cpu.X = cpu.memory.readUInt8(cpu.PC + 1);
      cpu.PC += 2;
      return 2;
    }
  ],
  [
    0xbd,
    function lda_i(cpu) {
      cpu.A = cpu.memory.readUInt8(cpu.memory.readUInt16LE(cpu.PC + 1) + cpu.X);
      cpu.PC += 3;
      return 2;
    }
  ],
  [
    0x9d,
    function sta_ax(cpu) {
      cpu.memory.writeUInt8(cpu.A, cpu.memory.readUInt16LE(cpu.PC + 1) + cpu.X);
      cpu.PC += 3;
      return 5;
    }
  ],
  [
    0xe8,
    function inx(cpu) {
      cpu.X += 1;
      cpu.PC += 1;
      return 2;
    }
  ],
  [
    0xe0,
    function cpx_i(cpu) {
      const m = cpu.memory.readUInt8(cpu.PC + 1);
      const x = cpu.X;
      if (x < m) {
        cpu.SF_N();
        cpu.SF_ZC();
        cpu.SF_CC();
      } else if (x > m) {
        cpu.SF_NC();
        cpu.SF_Z();
        cpu.SF_C();
      } else {
        cpu.SF_NC();
        cpu.SF_ZC();
        cpu.SF_C();
      }
      cpu.PC += 2;
      return 2;
    }
  ],
  [
    0xc9,
    function cmp_i(cpu) {
      const m = cpu.memory.readUInt8(cpu.PC + 1);
      const a = cpu.A;
      if (a < m) {
        cpu.SF_N();
        cpu.SF_ZC();
        cpu.SF_CC();
      } else if (a > m) {
        cpu.SF_NC();
        cpu.SF_Z();
        cpu.SF_C();
      } else {
        cpu.SF_NC();
        cpu.SF_ZC();
        cpu.SF_C();
      }
      cpu.PC += 2;
      return 2;
    }
  ],
  [
    0xd0,
    function bne(cpu) {
      let cycles = 2;
      if (cpu.SF_ZV === 0) {
        cycles += 1;
        const page = ~~(cpu.PC / 256);
        cpu.PC += cpu.memory.readInt8(cpu.PC + 1);
        if (page != ~~(cpu.PC / 256)) {
          cycles += 1;
        }
      }
      cpu.PC += 2;
      return cycles;
    }
  ],
  [
    0xa9,
    function lda_i(cpu) {
      cpu.A = cpu.memory.readUInt8(cpu.PC + 1);
      cpu.PC += 2;
      return 2;
    }
  ],
  [
    0x48,
    function pha(cpu) {
      cpu.memory.writeUInt8(cpu.A, cpu.memory.stack + cpu.SP);
      cpu.SP -= 1;
      cpu.PC += 1;
      return 3;
    }
  ],
  [
    0x68,
    function pla(cpu) {
      cpu.SP += 1;
      cpu.A = cpu.memory.readUInt8(cpu.memory.stack + cpu.SP);
      cpu.PC += 1;
      return 4;
    }
  ],
  [
    0x18,
    function clc(cpu) {
      cpu.SF_CC();
      cpu.PC += 1;
      return 2;
    }
  ],
  [
    0x69,
    function adc_i(cpu) {
      const a = cpu.A;
      cpu.A += cpu.memory.readUInt8(cpu.PC + 1) + cpu.SF_CV;
      cpu.SF = 0;
      const newA = cpu.A;
      if (newA > 127) {
        cpu.SF_N();
        if (a < 128) {
          cpu.SF_C();
        }
      }
      if (a > newA) {
        cpu.SF_V();
        cpu.SF_CC();
      }
      if (newA === 0) {
        cpu.SF_Z();
      }
      cpu.PC += 2;
      return 2;
    }
  ],
  [
    0x20,
    function jsr(cpu) {
      cpu.memory.writeUInt16LE(cpu.PC + 3, cpu.memory.stack + cpu.SP - 1);
      cpu.SP -= 2;
      cpu.PC = cpu.memory.readUInt16LE(cpu.PC + 1);
      return 6;
    }
  ],
  [
    0xaa,
    function tax(cpu) {
      cpu.X = cpu.A;
      if (cpu.X > 127) {
        cpu.SF_N();
      } else {
        cpu.SF_NC();
      }
      if (cpu.X === 0) {
        cpu.SF_Z();
      } else {
        cpu.SF_ZC();
      }
      cpu.PC += 1;
      return 2;
    }
  ],
  [
    0x60,
    function rts(cpu) {
      if (cpu.SP + 2 > 255) {
        cpu.SP = 255;
        cpu.PC = 0;
        return 6;
      }
      cpu.SP += 2;
      cpu.PC = cpu.memory.readUInt16LE(cpu.memory.stack + cpu.SP - 1);
      return 6;
    }
  ]
]);

class C6510 {
  constructor(memory) {
    this.memory = memory;
    this.buffer = Buffer.alloc(7);
    this.SF = 0;
  }
  get PC() {
    return this.buffer.readUInt16LE(0);
  }
  set PC(pc) {
    this.buffer.writeUInt16LE(pc);
  }
  get A() {
    return this.buffer.readUInt8(2);
  }
  set A(a) {
    this.buffer.writeUInt8(a, 2);
  }
  get SP() {
    return this.buffer.readUInt8(3);
  }
  set SP(sp) {
    this.buffer.writeUInt8(sp, 3);
  }
  get X() {
    return this.buffer.readUInt8(4);
  }
  set X(x) {
    this.buffer.writeUInt8(x, 4);
  }
  get Y() {
    return this.buffer.readUInt8(5);
  }
  set Y(y) {
    this.buffer.writeUInt8(y, 5);
  }
  get SF() {
    return this.buffer.readUInt8(6);
  }
  set SF(sf) {
    this.buffer.writeUInt8(sf | (1 << 5), 6);
  }
  get SF_NV() {
    return (this.SF >>> 7) & 1;
  }
  get SF_VV() {
    return (this.SF >>> 6) & 1;
  }
  get SF_BV() {
    return (this.SF >>> 4) & 1;
  }
  get SF_DV() {
    return (this.SF >>> 3) & 1;
  }
  get SF_IV() {
    return (this.SF >>> 2) & 1;
  }
  get SF_ZV() {
    return (this.SF >>> 1) & 1;
  }
  get SF_CV() {
    return this.SF & 1;
  }
  SF_N() {
    this.SF |= 1 << 7;
  }
  SF_V() {
    this.SF |= 1 << 6;
  }
  SF_B() {
    this.SF |= 1 << 4;
  }
  SF_D() {
    this.SF |= 1 << 3;
  }
  SF_I() {
    this.SF |= 1 << 2;
  }
  SF_Z() {
    this.SF |= 1 << 1;
  }
  SF_C() {
    this.SF |= 1;
  }
  SF_NC() {
    this.SF &= ~(1 << 7);
  }
  SF_VC() {
    this.SF &= ~(1 << 6);
  }
  SF_BC() {
    this.SF &= ~(1 << 4);
  }
  SF_DC() {
    this.SF &= ~(1 << 3);
  }
  SF_IC() {
    this.SF &= ~(1 << 2);
  }
  SF_ZC() {
    this.SF &= ~(1 << 1);
  }
  SF_CC() {
    this.SF &= ~1;
  }
  resume(targetCycles) {
    let cycles = 0;
    while (cycles < targetCycles) {
      const code = this.memory.readUInt8(this.PC);
      if (!this.PC) {
        return -cycles;
      }
      if (!operations.has(code)) {
        throw new Error(`Invalid opcode: 0x${code.toString(16)}`);
      }
      cycles += operations.get(code)(this);
    }
    return cycles;
  }
}

module.exports = {
  C6510
};
