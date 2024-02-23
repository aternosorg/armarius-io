/**
 * @interface
 */
export default class DataProcessor {
    /**
     * @return {boolean}
     * @abstract
     */
    static isSupported() {
    }

    /**
     * @return {?CRC32}
     */
    getPreCrc() {
    }

    /**
     * @return {?CRC32}
     */
    getPostCrc() {
    }

    /**
     * @return {BigInt}
     */
    getPreLength() {
    }

    /**
     * @return {BigInt}
     */
    getPostLength() {
    }

    /**
     * @param {number} length
     * @return {Promise<Uint8Array>}
     * @protected
     */
    async getChunkFromReader(length) {
    }

    /**
     * @param {number} length
     * @return {Promise<?Uint8Array>}
     * @protected
     * @abstract
     */
    async generate(length) {
    }

    /**
     * @param {number} length
     * @return {Promise<?Uint8Array>}
     */
    async read(length) {
    }

    /**
     * @return {Promise<DataProcessor>}
     */
    async reset() {
        return this;
    }
}

