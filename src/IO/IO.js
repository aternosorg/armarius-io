import BigInt from "../Util/BigInt.js";
import BigIntUtils from "../Util/BigIntUtils.js";
import DataStream from "./DataStream.js";

/**
 * @implements {DataStream}
 */
export default class IO extends DataStream {
    /** @type {number} */ byteOffset = 0;
    /** @type {number} */ byteLength;
    /** @type {number} */ offset = 0;
    /** @type {number} */ bufferSize = 4096;

    /**
     * @param {number} cloneOffset
     * @param {?number} cloneLength
     * @return {Promise<IO>}
     * @abstract
     */
    async clone(cloneOffset = 0, cloneLength = null) {
        throw new Error(`clone() is not implemented in ${this.constructor.name}.`);
    }

    /**
     * @param {number} offset
     * @param {number} length
     * @param {boolean} longLived
     * @return {Promise<Uint8Array>}
     * @abstract
     */
    async readAt(offset, length, longLived = true) {
        throw new Error(`readAt() is not implemented in ${this.constructor.name}.`);
    }

    /**
     * @param {number} offset
     * @param {Uint8Array} data
     * @return {Promise<void>}
     * @abstract
     */
    async writeAt(offset, data) {
        throw new Error(`writeAt() is not implemented in ${this.constructor.name}.`);
    }

    /**
     * @param {number} length
     * @param {boolean} longLived
     * @return {Promise<Uint8Array>}
     */
    async read(length, longLived = true) {
        let value = await this.readAt(this.offset, length, longLived);
        this.offset += length;
        return value;
    }

    /**
     * @param {Uint8Array} data
     * @return {Promise<void>}
     */
    async write(data) {
        await this.writeAt(this.offset, data);
        this.offset += data.byteLength;
    }

    /**
     * @param {number} offset
     * @param {number} length
     * @param {boolean} longLived
     * @return {Promise<DataView>}
     */
    async readDVAt(offset, length, longLived = true) {
        let data = await this.readAt(offset, length);
        return new DataView(data.buffer, data.byteOffset, data.byteLength);
    }

    /**
     * @param {number} offset
     * @return {Promise<number>}
     */
    async getUint8At(offset) {
        return (await (this.readDVAt(offset, 1, false))).getUint8(0);
    }

    /**
     * @param {number} offset
     * @param {boolean} littleEndian
     * @return {Promise<number>}
     */
    async getUint16At(offset, littleEndian = true) {
        return (await (this.readDVAt(offset, 2, false))).getUint16(0, littleEndian);
    }

    /**
     * @param {number} offset
     * @param {boolean} littleEndian
     * @return {Promise<number>}
     */
    async getUint32At(offset, littleEndian = true) {
        return (await (this.readDVAt(offset, 4, false))).getUint32(0, littleEndian);
    }

    /**
     * @param {number} offset
     * @param {boolean} littleEndian
     * @return {Promise<BigInt>}
     */
    async getBigUint64At(offset, littleEndian = true) {
        return BigIntUtils.getBigUint64FromView(await this.readDVAt(offset, 8, false), 0, littleEndian);
    }

    /**
     * @return {Promise<number>}
     */
    async getUint8() {
        let value = await this.getUint8At(this.offset);
        this.offset += 1;
        return value;
    }

    /**
     * @param {boolean} littleEndian
     * @return {Promise<number>}
     */
    async getUint16(littleEndian = true) {
        let value = await this.getUint16At(this.offset, littleEndian);
        this.offset += 2;
        return value;
    }

    /**
     * @param {boolean} littleEndian
     * @return {Promise<number>}
     */
    async getUint32(littleEndian = true) {
        let value = await this.getUint32At(this.offset, littleEndian);
        this.offset += 4;
        return value;
    }

    /**
     * @param {boolean} littleEndian
     * @return {Promise<BigInt>}
     */
    async getBigUint64(littleEndian = true) {
        let value = await this.getBigUint64At(this.offset, littleEndian);
        this.offset += 8;
        return value;
    }

    /**
     * @param {number} offset
     * @return {IO}
     */
    seek(offset) {
        if (!this.isSeekable()) {
            throw new Error(`IO object is not seekable.`);
        }
        this.offset = offset;
        return this;
    }

    /**
     * @inheritDoc
     */
    async reset() {
        this.seek(0);
        return this;
    }

    /**
     * @param {number} size
     * @return {IO}
     */
    setMaxBufferSize(size) {
        this.bufferSize = size;
        return this;
    }

    /**
     * @return {boolean}
     * @abstract
     */
    isReadable() {
        return false;
    }

    /**
     * @return {boolean}
     * @abstract
     */
    isWritable() {
        return false;
    }

    /**
     * @return {boolean}
     * @abstract
     */
    isSeekable() {
        return false;
    }

    /**
     * @return {boolean}
     * @abstract
     */
    isCloneable() {
        return false;
    }

    /**
     * @return {boolean}
     */
    isResettable() {
        return this.isSeekable();
    }

    /**
     * @inheritDoc
     */
    async pull(length) {
        if (this.offset >= this.byteLength) {
            return null;
        }
        length = Math.min(length, this.byteLength - this.offset);
        return await this.read(length, false);
    }

    /**
     * Find the last index of a byte sequence or uint32
     *
     * @param {number|Uint8Array} search
     * @param {number} minOffset
     * @param {number} maxOffset
     * @param {number} chunkSize
     * @returns {Promise<number>}
     */
    async lastIndexOf(search, minOffset = 0, maxOffset = this.byteLength, chunkSize = 512) {
        let searchData;
        if(search instanceof Uint8Array) {
            searchData = search;
        }else {
            searchData = new Uint8Array(4);
            (new DataView(searchData.buffer, searchData.byteOffset, searchData.byteLength)).setUint32(0, search, true);
        }

        minOffset = Math.max(0, minOffset);
        maxOffset = Math.min(this.byteLength, maxOffset);
        if(searchData.byteLength === 0) {
            return maxOffset;
        }

        let currentStartOffset;
        while (maxOffset - minOffset >= 0) {
            currentStartOffset = Math.max(maxOffset - chunkSize, minOffset);
            let readLength = Math.min(chunkSize + searchData.byteLength, this.byteLength - currentStartOffset);
            let chunk = await this.readAt(currentStartOffset, readLength, false);

            let index = Infinity;
            while(index > 0 && (index = chunk.lastIndexOf(searchData[0], index - 1)) !== -1) {
                let found = true;
                for(let i = 0; i < searchData.length; i++) {
                    if(searchData[i] !== chunk[index + i]) {
                        found = false;
                        break;
                    }
                }
                if(found) {
                    return currentStartOffset + index;
                }
            }
            maxOffset -= chunkSize;
        }
        return -1;
    }

    /**
     * @inheritDoc
     */
    getFinalLength() {
        return this.byteLength;
    }
}

