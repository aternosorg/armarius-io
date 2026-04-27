import {asyncDispose} from "../../Util/symbols.js";

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
     * @param {string} path
     * @returns {string}
     */
    normalizePath(path) {
        let leadingSlash = path.startsWith("/");
        let trailingSlash = path.endsWith("/") && path.length > 1;
        let parts = path.split("/");
        let parentSteps = [];
        let result = [];
        for (let part of parts) {
            if (part === "" || part === ".") {
                continue;
            }
            if (part === "..") {
                if (result.length === 0) {
                    parentSteps.push("..");
                } else {
                    result.pop();
                }
                continue;
            }
            result.push(part);
        }
        result = parentSteps.concat(result);
        return (leadingSlash ? "/" : "") + result.join("/") + (trailingSlash ? "/" : "");
    }

    /**
     * @param {string} relativePath
     * @param {?boolean} trailingSlash
     * @returns {URL}
     */
    getRelativePath(relativePath, trailingSlash = null) {
        let normalized = this.normalizePath(relativePath);
        if (normalized.startsWith('..')) {
            throw new Error(`Relative path "${relativePath}" is outside of the root directory.`);
        }
        if (trailingSlash === true && !normalized.endsWith("/")) {
            normalized += "/";
        } else if (trailingSlash === false && normalized.endsWith("/")) {
            normalized = normalized.slice(0, -1);
        }

        let url = this.getUrl();
        if (!url.pathname.endsWith("/")) {
            url = new URL(url.href + "/");
        }

        return new URL(normalized, url);
    }
}
