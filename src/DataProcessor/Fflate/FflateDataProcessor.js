import AbstractDataProcessor from "../AbstractDataProcessor.js"

/**
 * @abstract
 */
export default class FflateDataProcessor extends AbstractDataProcessor {
    /** @type {Uint8Array[]} */ chunks = [];
    /** @type {import("fflate").Deflate|import("fflate").Inflate} */ flate;

    /**
     * @inheritDoc
     */
    constructor(reader, createPreCrc = false, createPostCrc = false) {
        super(reader, createPreCrc, createPostCrc);
        this.initFflate();
    }

    /**
     * @inheritDoc
     */
    async generate(length) {
        if (this.isEof()) {
            return null;
        }

        this.push(await this.getChunkFromReader(length), this.isEof());
        return this.concatChunks();
    }

    /**
     * @param {Uint8Array} data
     * @param {boolean} final
     */
    push(data, final) {
        this.flate.push(data, final);
    }

    /**
     * @protected
     * @return {Uint8Array}
     */
    concatChunks() {
        let chunks = this.chunks;
        this.chunks = [];

        if (!chunks.length) {
            return new Uint8Array(0);
        }
        if (chunks.length === 1) {
            return chunks[0];
        }

        let length = chunks.reduce((total, chunk) => total + chunk.byteLength, 0);
        let res = new Uint8Array(length);
        let offset = 0;
        for (let chunk of chunks) {
            res.set(chunk, offset);
            offset += chunk.byteLength;
        }
        return res;
    }

    /**
     * @protected
     * @abstract
     */
    initFflate() {

    }

    /**
     * @protected
     * @param {Uint8Array} chunk
     * @param {boolean} final
     */
    onData(chunk, final) {
        this.chunks.push(chunk);
    }

    /**
     * @inheritDoc
     */
    async reset() {
        await super.reset();
        this.chunks = [];
        this.initFflate();
        return this;
    }
}
