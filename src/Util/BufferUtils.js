export default class BufferUtils {
    static EMPTY = new Uint8Array(0);

    static concatBuffers(chunks) {
        if (!chunks.length) {
            return BufferUtils.EMPTY;
        }
        if (chunks.length === 1) {
            return chunks[0];
        }

        let length = chunks.reduce((total, chunk) => total + chunk.byteLength, 0);
        let res = new Uint8Array(length);
        let offset = 0;
        for (let chunk of chunks) {
            res.set(chunk, offset);
            offset += chunk.byteLength;
        }
        return res;
    }
}
