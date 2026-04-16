import StatInterface from "./StatInterface.js";

export default class Stat extends StatInterface {
    /** @type {boolean} */ directory;
    /** @type {boolean} */ file;
    /** @type {boolean} */ symbolicLink;
    /** @type {number} */ size;
    /** @type {Date} */ atime;
    /** @type {Date} */ mtime;
    /** @type {Date} */ ctime;

    /**
     * @param {boolean} isDirectory
     * @param {boolean} isFile
     * @param {boolean} isSymbolicLink
     * @param {number} size
     * @param {Date} atime
     * @param {Date} mtime
     * @param {Date} ctime
     */
    constructor(isDirectory, isFile, isSymbolicLink, size, atime, mtime, ctime) {
        super();
        this.directory = isDirectory;
        this.file = isFile;
        this.symbolicLink = isSymbolicLink;
        this.size = size;
        this.atime = atime;
        this.mtime = mtime;
        this.ctime = ctime;
    }

    /**
     * @return {boolean}
     */
    isDirectory() {
        return this.directory;
    }

    /**
     * @return {boolean}
     */
    isFile() {
        return this.file;
    }

    /**
     * @return {boolean}
     */
    isSymbolicLink() {
        return this.symbolicLink;
    }

    /**
     * @return {number}
     */
    getSize() {
        return this.size;
    }

    /**
     * @return {Date}
     */
    getAtime() {
        return this.atime;
    }

    /**
     * @return {Date}
     */
    getMtime() {
        return this.mtime;
    }

    /**
     * @return {Date}
     */
    getCtime() {
        return this.ctime;
    }
}
