import FileHandleInterface from "../FileHandleInterface.js";
import BlobIO from "../../BlobIO.js";
import Stat from "../Stat.js";

export default class BlobMapFileHandle extends FileHandleInterface {
    /** @type {BlobMapFileSystem} */ fileSystem;
    /** @type {URL} */ url;

    /**
     * @param {BlobMapFileSystem} fileSystem
     * @param {URL} url
     */
    constructor(fileSystem, url) {
        super();
        this.fileSystem = fileSystem;
        this.url = url;
    }

    /**
     * @returns {string}
     */
    getNormalPath() {
        return this.url.pathname.replace(/^\/|\/$/g, '');
    }

    async createChildDirectory(relativePath) {
        throw new Error("BlobMapFileSystem is read-only");
    }

    async exists() {
        return this.fileSystem.blobMap.has(this.getNormalPath());
    }

    async getChild(relativePath) {
        let url = this.getRelativePath(relativePath);
        return new this.constructor(url);
    }

    async* getChildren() {
        let prefix = this.getNormalPath();
        if (prefix.length > 0 && !prefix.endsWith('/')) {
            prefix += '/';
        }
        for (let path of this.fileSystem.blobMap.keys()) {
            if (path.startsWith(prefix)) {
                let relativePath = path.substring(prefix.length);
                if (!relativePath.includes('/')) {
                    let url = this.getRelativePath(relativePath);
                    yield new this.constructor(url);
                }
            }
        }
    }

    getUrl() {
        return this.url;
    }

    async open(readable, writable) {
        if (writable) {
            throw new Error("BlobMapFileSystem is read-only");
        }
        let blob = this.fileSystem.blobMap.get(this.getNormalPath());
        if (blob === undefined) {
            throw new Error(`File "${this.url.pathname}" does not exist.`);
        }
        if (blob === null) {
            throw new Error(`Path "${this.url.pathname}" is a directory.`);
        }
        return new BlobIO(blob, 0, blob.size);
    }

    async stat() {
        let blob = this.fileSystem.blobMap.get(this.getNormalPath());
        if (blob === undefined) {
            throw new Error(`File "${this.url.pathname}" does not exist.`);
        }
        return new Stat(
            blob === null,
            blob !== null,
            false,
            blob?.size ?? 0,
            new Date(0),
            new Date(0),
            new Date(0)
        );
    }
}
