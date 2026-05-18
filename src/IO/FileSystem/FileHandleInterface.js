import {asyncDispose} from "../../Util/symbols.js";
import Path from "../../Util/Path.js";

export default class FileHandleInterface {
    /**
     * Open the file for reading and/or writing.
     * If the file is a directory, an error is thrown.
     * If the file does not exist and is opened for writing, it is created.
     *
     * The returned IO object must stay usable until its dispose method is called.
     * Disposing of this file handle must not dispose of the IO object.
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
    async* getChildren() {

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

    /**
     * @return {URL}
     * @abstract
     */
    getUrl() {

    }

    async [asyncDispose]() {

    }

    /**
     * @param {string} relativePath
     * @param {?boolean} trailingSlash
     * @returns {URL}
     */
    getRelativePath(relativePath, trailingSlash = null) {
        let normalized = Path.normalize(relativePath);
        if (normalized.startsWith('..')) {
            throw new Error(`Relative path "${relativePath}" is outside of the root directory.`);
        }
        if (normalized.startsWith('/')) {
            throw new Error(`Relative path "${relativePath}" must not start with a slash.`);
        }
        if (trailingSlash === true && !normalized.endsWith("/")) {
            normalized += "/";
        } else if (trailingSlash === false && normalized.endsWith("/")) {
            normalized = normalized.slice(0, -1);
        }

        normalized = normalized.split('/').map(p => encodeURIComponent(p)).join('/');

        let url = this.getUrl();
        if (!url.pathname.endsWith("/")) {
            url = new URL(url);
            url.pathname += "/";
        }

        return new URL(normalized, url);
    }
}
