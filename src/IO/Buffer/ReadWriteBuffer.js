export default class ReadWriteBuffer {
    /** @type {number} */ offset= 0;
    /** @type {?Uint8Array} */ data = null;
    /** @type {?DataView} */ dataView= null;
    /** @type {number} */ bufferSize = 4 * 1024;

    /**
     * @param {number} size
     * @return {this}
     */
    setBufferSize(size) {
        this.bufferSize = size;
        return this;
    }

    /**
     * @param {number} offset
     * @param {Uint8Array} data
     * @return {this}
     */
    setData(offset, data) {
        this.data = data;
        this.dataView = new DataView(data.buffer, data.byteOffset, data.byteLength);
        this.offset = offset;
        return this;
    }

    /**
     * @return {number}
     */
    getOffset() {
        return this.offset;
    }

    /**
     * @return {Uint8Array}
     */
    getData() {
        return this.data ?? new Uint8Array(0);
    }

    /**
     * @return {boolean}
     */
    hasData() {
        return this.data !== null;
    }

    /**
     * @return {?DataView}
     */
    getDataView() {
        return this.dataView;
    }

    /**
     * @param {number} offset
     * @param {number} length
     * @return {boolean}
     */
    has(offset, length) {
        return this.data && this.offset <= offset && this.offset + this.data.byteLength >= offset + length;
    }

    /**
     * @param {number} offset
     * @param {number} length
     * @return {boolean}
     */
    intersect(offset, length) {
        return this.data && this.offset <= offset + length && this.offset + this.data.byteLength >= offset;
    }

    /**
     * @param {number} offset
     * @param {number} length
     * @param {boolean} copy
     * @return {Uint8Array}
     */
    get(offset, length, copy = false) {
        let chunk = this.data.subarray(offset - this.offset, offset - this.offset + length);
        if (copy) {
            let result = new Uint8Array(length);
            result.set(chunk);
            return result;
        }
        return chunk;
    }

    /**
     * @param {number} offset
     * @param {Uint8Array} data
     * @return {boolean}
     */
    append(offset, data) {
        if (!this.data) {
            if (data.byteLength > this.bufferSize) {
                return false;
            }

            this.offset = offset;
            let arrayBuffer = new ArrayBuffer(this.bufferSize);
            this.data = new Uint8Array(arrayBuffer, 0, 0);
            this.dataView = new DataView(arrayBuffer, 0, 0);
        }else if (offset !== this.offset + this.data.byteLength) {
            return false;
        }

        let targetOffset = this.data.byteLength;
        let remaining = this.data.buffer.byteLength - (this.data.byteOffset + this.data.byteLength);
        if (remaining < data.byteLength) {
            return false;
        }

        this.data = new Uint8Array(this.data.buffer, this.data.byteOffset, this.data.byteLength + data.byteLength);
        this.dataView = new DataView(this.data.buffer, this.data.byteOffset, this.data.byteLength);
        this.data.set(data, targetOffset);
        return true;
    }

    /**
     * @return {this}
     */
    clear() {
        this.offset = 0;
        this.data = null;
        this.dataView = null;
        return this;
    }
}
