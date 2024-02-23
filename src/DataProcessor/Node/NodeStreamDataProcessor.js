import AbstractDataProcessor from '../AbstractDataProcessor.js';
import BufferUtils from '../../Util/BufferUtils.js';

export default class NodeStreamDataProcessor extends AbstractDataProcessor {
    /** @type {import("node:zlib").default} */ static zlib = null;
    /** @type {Uint8Array[]} */ chunks = [];
    /** @type {module:stream.internal.Transform} */ transform = null;

    /**
     * @return {boolean}
     */
    static isSupported() {
        return !!(typeof process === 'object' && process.versions && process.versions.node);
    }

    /**
     * @return {import("node:zlib").default}
     */
    static async getZlib() {
        if (this.zlib === null) {
            try {
                this.zlib = await import('node:zlib');
            } catch (e) {
                throw new Error('NodeStreamDataProcessor can only be used in a Node.js environment')
            }
        }
        return this.zlib;
    }

    /**
     * @inheritDoc
     */
    constructor(reader, createPreCrc = false, createPostCrc = false) {
        super(reader, createPreCrc, createPostCrc);
    }

    /**
     * @abstract
     * @return {Promise<void>}
     */
    async initTransform() {
    }

    /**
     * @inheritDoc
     */
    async generate(length) {
        if(this.chunkReader.isEof()) {
            return null;
        }

        if (this.transform === null) {
            await this.initTransform();
        }

        await this.writeAsync(this.transform, await this.chunkReader.getChunk(length));
        if (this.chunkReader.isEof()) {
            await this.endAsync(this.transform);
        }
        return this.concatChunks();
    }

    writeAsync(stream, data) {
        return new Promise((resolve, reject) => {
            stream.write(data, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    endAsync(stream) {
        return new Promise((resolve, reject) => {
            stream.on('end', resolve);
            stream.end((err) => {
                if (err) {
                    reject(err);
                }
            });
        });
    }

    /**
     * @protected
     * @returns {Uint8Array}
     */
    concatChunks() {
        let chunks = this.chunks;
        this.chunks = [];

        return BufferUtils.concatBuffers(chunks);
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
        this.transform = null;
        return this;
    }
}
