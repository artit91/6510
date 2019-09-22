class Memory {
  constructor() {
    this.buffer = Buffer.alloc(65536);
    this._stack = new Uint16Array(1);
  }
  load(buffer, start, length) {
    buffer.copy(this.buffer, start, 0, length);
  }
  get stack() {
    return this._stack[0];
  }
  set stack(stack) {
    this._stack[0] = stack;
  }
  slice(start, length) {
    return this.buffer.slice(start, start + length);
  }
  readUInt8(offset) {
    return this.buffer.readUInt8(offset);
  }
  writeUInt8(value, offset) {
    this.buffer.writeUInt8(value, offset);
  }
  readUInt16LE(offset) {
    return this.buffer.readUInt16LE(offset);
  }
  writeUInt16LE(value, offset) {
    return this.buffer.writeUInt16LE(value, offset);
  }
  readInt8(offset) {
    return this.buffer.readInt8(offset);
  }
}

module.exports = {
  Memory
};
