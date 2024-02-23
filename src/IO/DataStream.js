/**
 * @interface
 */
export default class DataStream {
    /**
     * @param {number} length
     * @return {Promise<?Uint8Array>}
     * @abstract
     */
    async pull(length) {

    }

    /**
     * Get the final length of the data stream.
     * Return null if the length is unknown.
     *
     * @return {?number}
     * @abstract
     */
    getFinalLength() {
    }

    /**
     * Get the current offset within the data stream.
     * (The number of bytes read so far since the stream was created/the last reset() call.)
     *
     * @return {number}
     * @abstract
     */
    getOffset() {

    }

    /**
     * @return {Promise<this>}
     * @abstract
     */
    async reset() {
        return this;
    }
}
