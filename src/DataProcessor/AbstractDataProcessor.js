import CRC32 from "../Util/CRC32.js"
import DataProcessor from "./DataProcessor.js"
import BigInt from "../Util/BigInt.js";
import DataProcessorChunkReader from "./DataProcessorChunkReader.js";

/**
 * @implements DataProcessor
 */
export default class AbstractDataProcessor extends DataProcessor {
    /** @type {DataStream} */ dataStream;
    /** @type {DataProcessorChunkReader} */ chunkReader;
    /** @type {?CRC32} */ postCrc = null;
    /** @type {boolean} */ createPreCrc;
    /** @type {BigInt} */ postLength = BigInt(0);

    /**
     * @inheritDoc
     */
    static isSupported() {
        return true;
    }

    /**
     * @param {DataStream} dataStream
     * @param {boolean} createPreCrc
     * @param {boolean} createPostCrc
     */
    constructor(dataStream, createPreCrc = false, createPostCrc = false) {
        super();
        this.dataStream = dataStream;
        this.createPreCrc = createPreCrc;
        this.chunkReader = new DataProcessorChunkReader(this.dataStream, this.createPreCrc)
        this.postCrc = createPostCrc ? new CRC32() : null;
    }

    /**
     * @return {boolean}
     */
    isEof() {
        return this.chunkReader.isEof();
    }

    /**
     * @inheritDoc
     */
    getPreCrc() {
        return this.chunkReader.getCrc();
    }

    /**
     * @inheritDoc
     */
    getPostCrc() {
        return this.postCrc;
    }

    /**
     * @inheritDoc
     */
    async getChunkFromReader(length) {
        return await this.chunkReader.getChunk(length);
    }

    /**
     * @inheritDoc
     */
    async generate(length) {

    }

    /**
     * @inheritDoc
     */
    async read(length) {
        let chunk = await this.generate(length);
        if (chunk !== null) {
            if (this.postCrc) {
                this.postCrc.add(chunk);
            }
            this.postLength += BigInt(chunk.byteLength);
        }

        return chunk;
    }

    /**
     * @inheritDoc
     */
    async reset() {
        await this.chunkReader.close();
        this.chunkReader = new DataProcessorChunkReader(this.dataStream, this.createPreCrc);
        this.postCrc?.reset();
        this.postLength = BigInt(0);
        await this.dataStream.reset();
        return this;
    }

    /**
     * @inheritDoc
     */
    getPostLength() {
        return this.postLength;
    }

    /**
     * @inheritDoc
     */
    getPreLength() {
        return this.chunkReader.getSize();
    }
}

