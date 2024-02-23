import BufferedIO from "./BufferedIO.js";

export default class NodeFileIO extends BufferedIO {
    /** @type {FileHandle} */ fileHandle;

    constructor(fileHandle, offset, size) {
        super();
        this.fileHandle = fileHandle;
        this.byteOffset = offset;
        this.byteLength = size;
    }

    /**
     * @inheritDoc
     */
    async clone(cloneOffset = 0, cloneLength = null) {
        return new this.constructor(this.fileHandle,  this.byteOffset + cloneOffset, cloneLength ?? this.byteLength - cloneOffset);
    }

    /**
     * @inheritDoc
     */
    isCloneable() {
        return true;
    }

    /**
     * @inheritDoc
     */
    isReadable() {
        return true;
    }

    /**
     * @inheritDoc
     */
    isSeekable() {
        return true;
    }

    /**
     * @inheritDoc
     */
    isWritable() {
        return true;
    }

    /**
     * @inheritDoc
     */
    async readRaw(offset, length) {
        let data = Buffer.alloc(length);
        let {bytesRead} = await this.fileHandle.read({
            buffer: data,
            length: length,
            position: this.byteOffset + offset
        });
        return new Uint8Array(data.buffer, data.byteOffset, bytesRead);
    }

    /**
     * @inheritDoc
     */
    async writeRaw(offset, data) {
        await this.fileHandle.write(data, 0, data.byteLength, this.byteOffset + offset);
        this.byteLength = Math.max(this.byteLength, this.byteOffset + offset + data.byteLength);
    }

    /**
     * @inheritDoc
     */
    async flush() {
        await super.flush();
        await this.fileHandle.sync();
        return this;
    }
}
