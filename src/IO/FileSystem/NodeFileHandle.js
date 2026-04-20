import FileHandleInterface from "./FileHandleInterface.js";
import * as pathModule from "node:path";
import * as fs from "node:fs";
import Stat from "./Stat.js";
import NodeFileIO from "../NodeFileIO.js";

/**
 * A simple file system implementation based on Node's fs/promises API.
 * This implementation is not safe against file system races. For cases where that is a concern,
 * a custom implementation of the FileHandle interface should be used.
 */
export default class NodeFileHandle extends FileHandleInterface {
    /** @type {URL} */ url;

    /**
     * @param {URL} url
     */
    constructor(url) {
        super();
        this.url = url;
    }

    /**
     * @param {string} relativePath
     * @param {boolean} trailingSlash
     * @returns {URL}
     */
    getRelativePath(relativePath, trailingSlash = false) {
        let normalized = pathModule.normalize(relativePath);
        if (normalized.startsWith('..')) {
            throw new Error(`Relative path "${relativePath}" is outside of the root directory.`);
        }
        if (trailingSlash && !normalized.endsWith("/")) {
            normalized += "/";
        }

        let url = this.url;
        if (!url.pathname.endsWith("/")) {
            url = new URL(url.href + "/");
        }

        return new URL(normalized, url);
    }

    /**
     * @inheritDoc
     */
    async createChildDirectory(relativePath) {
        let url = this.getRelativePath(relativePath, true);
        await fs.promises.mkdir(url, {recursive: true});
        return new this.constructor(url);
    }

    /**
     * @inheritDoc
     */
    async exists() {
        try {
            await fs.promises.access(this.url);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * @param {string} relativePath
     * @returns {Promise<NodeFileHandle>}
     */
    async getChild(relativePath) {
        let url = this.getRelativePath(relativePath);
        return new this.constructor(url);
    }

    /**
     * @inheritDoc
     */
    async* getChildren() {
        for await (let child of await fs.promises.opendir(this.url)) {
            let url = this.getRelativePath(child.name);
            yield new this.constructor(url);
        }
    }

    /**
     * @inheritDoc
     */
    async open(readable, writable) {
        let flags = 0;
        if (readable && writable) {
            flags = fs.constants.O_RDWR | fs.constants.O_CREAT;
        } else if (readable) {
            flags = fs.constants.O_RDONLY;
        } else if (writable) {
            flags = fs.constants.O_WRONLY | fs.constants.O_CREAT;
        }
        return await NodeFileIO.open(this.url, flags);
    }

    /**
     * @inheritDoc
     */
    async stat() {
        let stat = await fs.promises.lstat(this.url);
        return new Stat(
            stat.isDirectory(),
            stat.isFile(),
            stat.isSymbolicLink(),
            stat.size,
            stat.atime,
            stat.mtime,
            stat.ctime
        );
    }

    /**
     * @returns {URL}
     */
    getUrl() {
        return this.url;
    }
}
