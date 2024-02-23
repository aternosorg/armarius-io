import {expect, test} from '@jest/globals';
import {BufferUtils} from "../index.js";

const chunk1 = new Uint8Array([122, 251, 111, 20]);
const chunk2 = new Uint8Array([16, 100, 157, 198]);

test('Concat Uint8arrays', () => {
    let result = BufferUtils.concatBuffers([chunk1, chunk2]);
    expect(result).toEqual(new Uint8Array([...chunk1, ...chunk2]));
});
