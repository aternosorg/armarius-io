import CRC32 from '../Util/CRC32.js';
import BigInt from "../Util/BigInt.js";

export default class DataProcessorChunkReader {
    /** @type {DataStream} */ dataStream;
    /** @type {boolean} */ eof = false;
    /** @type {boolean} */ closed = false;
    /** @type {boolean} */ reading = false;
    /** @type {Array} */ closePromises = [];
    /** @type {?CRC32} */ crc = null;
    /** @type {BigInt} */ size = BigInt(0);

    /**
     * @param {DataStream} dataStream
     * @param {boolean} createCrc
     */
    constructor(dataStream, createCrc = false) {
        this.dataStream = dataStream;
        this.crc = createCrc ? new CRC32() : null;
    }

    /**
     * @param {number} length
     * @return {Promise<Uint8Array>}
     */
    async getChunk(length) {
        if (this.closed) {
            return new Uint8Array(0);
        }
        if (this.reading) {
            throw new Error('Simultaneous read not supported');
        }
        this.reading = true;

        let chunk = await this.dataStream.pull(length);
        if (!chunk) {
            this.eof = true;
            chunk = new Uint8Array(0);
        }

        this.size += BigInt(chunk.byteLength);
        if(this.crc) {
            this.crc.add(chunk);
        }

        this.reading = false;

        if (this.closePromises.length > 0) {
            this.closePromises.forEach(resolve => resolve());
            this.closePromises = [];
        }

        return chunk;
    }

    /**
     * @return {boolean}
     */
    isEof() {
        return this.eof;
    }

    /**
     * @return {?CRC32}
     */
    getCrc() {
        return this.crc;
    }

    /**
     * @return {BigInt}
     */
    getSize() {
        return this.size;
    }

    /**
     * @return {Promise<void>}
     */
    close() {
        this.closed = true;
        if (this.reading) {
            return new Promise(resolve => {
                this.closePromises.push(resolve);
            });
        }
        return Promise.resolve();
    }
}
