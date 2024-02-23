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
     * @return {?number}
     * @abstract
     */
    getFinalLength() {
    }

    /**
     * @return {Promise<this>}
     * @abstract
     */
    async reset() {
        return this;
    }
}
