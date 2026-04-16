export default class StatInterface {
    /**
     * @return {boolean}
     * @abstract
     */
    isDirectory() {
    }

    /**
     * @return {boolean}
     * @abstract
     */
    isFile() {
    }

    /**
     * @return {boolean}
     * @abstract
     */
    isSymbolicLink() {
    }

    /**
     * @return {number}
     * @abstract
     */
    getSize() {
    }

    /**
     * @return {Date}
     * @abstract
     */
    getAtime() {
    }

    /**
     * @return {Date}
     * @abstract
     */
    getMtime() {
    }

    /**
     * @return {Date}
     * @abstract
     */
    getCtime() {
    }
}
