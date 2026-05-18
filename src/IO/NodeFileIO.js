import BufferedIO from "./BufferedIO.js";
import {asyncDispose} from "../Util/symbols.js";
import * as fs from "node:fs";

export default class NodeFileIO extends BufferedIO {
    /** @type {FileHandle} */ fileHandle;

    /**
     * @param {import("node:fs").PathLike} path
     * @param {string|number} flags
     * @param {import("node:fs").Mode} mode
     * @returns {Promise<NodeFileIO>}
     */
    static async open(path, flags = "r", mode = 0o666) {
        let fd = await fs.promises.open(path, flags, mode);
        let stats;
        try {
            stats = await fd.stat();
        } catch (e) {
            await fd.close();
            throw e;
        }
        if (stats.isDirectory() || !stats.isFile()) {
            await fd.close();
            throw new Error("Cannot open directory as IO");
        }
        return new this(fd, 0, stats.size);
    }

    constructor(fileHandle, offset, size) {
        super();
        this.fileHandle = fileHandle;
        this.byteOffset = offset;
        this.byteLength = size;
    }

    /**
     * @inheritDoc
     */
    async clone(cloneOffset = 0, cloneLength = null) {
        return new this.constructor(this.fileHandle,  this.byteOffset + cloneOffset, cloneLength ?? this.byteLength - cloneOffset);
    }

    /**
     * @inheritDoc
     */
    isCloneable() {
        return true;
    }

    /**
     * @inheritDoc
     */
    isReadable() {
        return true;
    }

    /**
     * @inheritDoc
     */
    isSeekable() {
        return true;
    }

    /**
     * @inheritDoc
     */
    isWritable() {
        return true;
    }

    /**
     * @inheritDoc
     */
    async readRaw(offset, length) {
        let data = Buffer.alloc(length);
        let {bytesRead} = await this.fileHandle.read({
            buffer: data,
            length: length,
            position: this.byteOffset + offset
        });
        return new Uint8Array(data.buffer, data.byteOffset, bytesRead);
    }

    /**
     * @inheritDoc
     */
    async writeRaw(offset, data) {
        await this.fileHandle.write(data, 0, data.byteLength, this.byteOffset + offset);
        this.byteLength = Math.max(this.byteLength, this.byteOffset + offset + data.byteLength);
    }

    /**
     * @inheritDoc
     */
    async flush() {
        await super.flush();
        if (this.fileHandle) {
            await this.fileHandle.sync();
        }
        return this;
    }

    async [asyncDispose]() {
        await super[asyncDispose]();
        let fileHandle = this.fileHandle;
        this.fileHandle = null;
        if (fileHandle) {
            await fileHandle.close();
        }
    }
}
