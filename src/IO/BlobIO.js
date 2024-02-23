import BufferedIO from "./BufferedIO.js";

export default class BlobIO extends BufferedIO {
    /** @type {Blob} */ blob;
    /** @type {FileReader} */ reader = new FileReader();
    /** @type {boolean} */ blocked = false;

    /**
     * @param {Blob} blob
     * @param {number} byteOffset
     * @param {?number} byteLength
     */
    constructor(blob, byteOffset = 0, byteLength = null) {
        super();
        this.blob = blob;
        this.byteLength = byteLength !== null ? byteLength : blob.size - byteOffset;
        this.byteOffset = byteOffset;
        if (this.byteLength < 0 || this.blob.size < this.byteOffset + this.byteLength) {
            throw new Error('Invalid file range');
        }
    }

    /**
     * @param {number} offset
     * @param {number} length
     * @protected
     * @return {Promise<Uint8Array>}
     */
    readRaw(offset, length) {
        return new Promise((resolve, reject) => {
            if (this.blocked) {
                return reject(Error('Multiple simultaneous reads are not supported'));
            }
            if (offset < 0) {
                return reject(new Error(`Cannot read at negative offsets (got ${offset})`));
            }
            if (offset + length > this.byteLength) {
                return reject(new Error(`Cannot read beyond end of data (trying to read ${length} bytes at ${offset}, data length is ${this.byteLength})`));
            }
            this.blocked = true;
            this.reader.onload = () => {
                this.blocked = false;
                /** @type {ArrayBuffer} */
                let res = this.reader.result;
                resolve(new Uint8Array(res));
            };
            this.reader.onerror = () => {
                reject(this.reader.error || new Error('An unknown error occurred while trying to read from Blob'));
            };
            this.reader.readAsArrayBuffer(this.blob.slice(this.byteOffset + offset, this.byteOffset + offset + length));
        });
    }

    /**
     * @inheritDoc
     */
    async clone(cloneOffset = 0, cloneLength = null) {
        if (cloneLength === null) {
            cloneLength = this.byteLength - cloneOffset;
        }
        return new this.constructor(this.blob, this.byteOffset + cloneOffset, cloneLength);
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
        return false;
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
    async writeRaw(offset, data) {
        throw new Error('BlobIO is not writable');
    }
}
