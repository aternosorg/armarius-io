import IO from "./IO.js";
import ReadWriteBuffer from "./Buffer/ReadWriteBuffer.js";
import BigIntUtils from "../Util/BigIntUtils.js";

/**
 * @abstract
 */
export default class BufferedIO extends IO {
    /** @type {ReadWriteBuffer} */ readBuffer = new ReadWriteBuffer();
    /** @type {ReadWriteBuffer} */ writeBuffer = new ReadWriteBuffer();

    constructor() {
        super();
        this.writeBuffer.setBufferSize(this.bufferSize);
    }

    /**
     * @param {number} offset
     * @param {number} length
     * @return {Promise<Uint8Array>}
     * @abstract
     */
    async readRaw(offset, length) {
    }

    /**
     * @param {number} offset
     * @param {Uint8Array} data
     * @return {Promise<void>}
     * @abstract
     */
    async writeRaw(offset, data) {
    }

    /**
     * @inheritDoc
     */
    async readAt(offset, length, longLived) {
        if (!this.isReadable()) {
            throw new Error(this.constructor.name + ' is not readable');
        }
        if (this.readBuffer.has(offset, length)) {
            return this.readBuffer.get(offset, length, longLived);
        }

        await this.writeOutBuffer();

        if (length < this.bufferSize) {
            this.readBuffer.setData(offset, await this.readRaw(offset, Math.max(length, Math.min(this.bufferSize, this.byteLength - offset))));
            return this.readBuffer.get(offset, length, longLived);
        }

        return await this.readRaw(offset, length);
    }

    /**
     * @inheritDoc
     */
    async writeAt(offset, data) {
        if (!this.isWritable()) {
            throw new Error(this.constructor.name + ' is not writable');
        }
        if (this.readBuffer.intersect(offset, data.length)) {
            this.readBuffer.clear();
        }

        if (this.writeBuffer.append(offset, data)) {
            return;
        }

        await this.writeOutBuffer();

        if (!this.writeBuffer.append(offset, data)) {
            await this.writeRaw(offset, data);
        }
    }

    /**
     * @return {Promise<this>}
     */
    async writeOutBuffer() {
        if (!this.writeBuffer.hasData()) {
            return this;
        }
        await this.writeRaw(this.writeBuffer.getOffset(), this.writeBuffer.getData());
        this.writeBuffer.clear();
        return this;
    }

    /**
     * @inheritDoc
     */
    async getUint8At(offset) {
        if (this.readBuffer.has(offset, 1)) {
            return this.readBuffer.getDataView().getUint8(offset - this.readBuffer.getOffset());
        }
        return super.getUint8At(offset);
    }

    /**
     * @inheritDoc
     */
    async getUint16At(offset, littleEndian = true) {
        if (this.readBuffer.has(offset, 2)) {
            return this.readBuffer.getDataView().getUint16(offset - this.readBuffer.getOffset(), littleEndian);
        }
        return super.getUint16At(offset, littleEndian);
    }

    /**
     * @inheritDoc
     */
    async getUint32At(offset, littleEndian = true) {
        if (this.readBuffer.has(offset, 4)) {
            return this.readBuffer.getDataView().getUint32(offset - this.readBuffer.getOffset(), littleEndian);
        }
        return super.getUint32At(offset, littleEndian);
    }

    /**
     * @inheritDoc
     */
    async getBigUint64At(offset, littleEndian = true) {
        if (this.readBuffer.has(offset, 8)) {
            return BigIntUtils.getBigUint64FromView(this.readBuffer.getDataView(), offset - this.readBuffer.getOffset(), littleEndian);
        }
        return super.getBigUint64At(offset, littleEndian);
    }

    /**
     * @return {Promise<this>}
     */
    async flush() {
        await this.writeOutBuffer();
        return this;
    }
}
