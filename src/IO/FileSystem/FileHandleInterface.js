export default class FileHandleInterface {
    /**
     * Open the file for reading and/or writing.
     * If the file is a directory, an error is thrown.
     * If the file does not exist and is opened for writing, it is created.
     *
     * @param {boolean} readable
     * @param {boolean} writable
     * @returns {Promise<IO>}
     * @abstract
     */
    async open(readable = true, writable = false) {

    }

    /**
     * @returns {Promise<StatInterface>}
     * @abstract
     */
    async stat() {

    }

    /**
     * @returns {Promise<boolean>}
     * @abstract
     */
    async exists() {

    }

    /**
     * @returns {AsyncGenerator<FileHandleInterface>}
     * @abstract
     */
    async *getChildren() {

    }

    /**
     * @param {string} relativePath
     * @returns {Promise<FileHandleInterface>}
     * @abstract
     */
    async getChild(relativePath) {

    }

    /**
     * Create a child directory with the given relative path and return its handle.
     * This will create the child path recursively if it does not exist.
     *
     * @param {string} relativePath
     * @returns {Promise<FileHandleInterface>}
     * @abstract
     */
    async createChildDirectory(relativePath) {

    }

    async [Symbol.asyncIterator]() {

    }
}
