import {expect, test} from '@jest/globals';
import {randomBytes} from 'node:crypto';
import {ArrayBufferIO} from "../index.js";

const bytes = randomBytes(1024);

test('Read data at offset', async () => {
    let io = new ArrayBufferIO(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    expect(await io.readAt(0, 4, true))
        .toEqual(new Uint8Array(bytes.buffer, bytes.byteOffset, 4));
    expect(await io.readAt(0, 4, false))
        .toEqual(new Uint8Array(bytes.buffer, bytes.byteOffset, 4));
    expect(await io.readAt(123, 12, true))
        .toEqual(new Uint8Array(bytes.buffer, bytes.byteOffset + 123, 12));
    expect(await io.readAt(123, 12, false))
        .toEqual(new Uint8Array(bytes.buffer, bytes.byteOffset + 123, 12));
});

test('Read data at cursor', async () => {
    let io = new ArrayBufferIO(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    expect(await io.read(4, false))
        .toEqual(new Uint8Array(bytes.buffer, bytes.byteOffset, 4));
    expect(await io.read(16, false))
        .toEqual(new Uint8Array(bytes.buffer, bytes.byteOffset + 4, 16));
});

test('Clone IO', async () => {
    let io1 = new ArrayBufferIO(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let io2 = await io1.clone();
    expect(await io1.read(4, false))
        .toEqual(new Uint8Array(bytes.buffer, bytes.byteOffset, 4));
    expect(await io2.read(4, false))
        .toEqual(new Uint8Array(bytes.buffer, bytes.byteOffset, 4));
});


test('Write data at offset', async () => {
    let bytes2 = randomBytes(1024);
    let io = new ArrayBufferIO(bytes2.buffer, bytes2.byteOffset, bytes2.byteLength);
    let before = await io.readAt(123, 4, true);
    await io.writeAt(123, new Uint8Array([1, 2, 3, 4]));
    let after = await io.readAt(123, 4, true);
    expect(before).not.toEqual(after);
    expect(after).toEqual(new Uint8Array([1, 2, 3, 4]));
});

test('Fail to write beyond buffer size', async () => {
    let io = new ArrayBufferIO(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    await expect(io.writeAt(1024, new Uint8Array([1, 2, 3, 4]))).rejects.toThrow();
});
