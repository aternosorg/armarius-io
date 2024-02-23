import {afterAll, beforeAll, expect, test} from '@jest/globals';
import {randomBytes} from 'node:crypto';
import {NodeFileIO} from "../index.js";
import pathModule from 'node:path';
import * as fs from "node:fs";

const fileSize = 1024;
const basePath = pathModule.dirname(new URL(import.meta.url).pathname) + '/data/nodefile/';
const bytes = randomBytes(fileSize);
let file1;
let file2;
let file3;

beforeAll(async () => {
    await fs.promises.mkdir(basePath, {recursive: true});
    await fs.promises.writeFile(basePath + 'test1.bin', bytes);
    await fs.promises.writeFile(basePath + 'test2.bin', bytes);
    await fs.promises.writeFile(basePath + 'test3.bin', bytes);

    file1 = await fs.promises.open(basePath + 'test1.bin', 'r');
    file2 = await fs.promises.open(basePath + 'test2.bin', 'r+');
    file3 = await fs.promises.open(basePath + 'test3.bin', 'r+');
});

afterAll(async () => {
    await file1.close();
    await file2.close();
    await file3.close();
    await fs.promises.rm(basePath, {recursive: true});
});

test('Read data at offset', async () => {
    let io = new NodeFileIO(file1, 0, fileSize);
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
    let io = new NodeFileIO(file1, 0, fileSize);
    expect(await io.read(4, false))
        .toEqual(new Uint8Array(bytes.buffer, bytes.byteOffset, 4));
    expect(await io.read(16, false))
        .toEqual(new Uint8Array(bytes.buffer, bytes.byteOffset + 4, 16));
});

test('Clone IO', async () => {
    let io1 = new NodeFileIO(file1, 0, fileSize);
    let io2 = await io1.clone();
    expect(await io1.read(4, false))
        .toEqual(new Uint8Array(bytes.buffer, bytes.byteOffset, 4));
    expect(await io2.read(4, false))
        .toEqual(new Uint8Array(bytes.buffer, bytes.byteOffset, 4));
});


test('Write data at offset', async () => {
    let io = new NodeFileIO(file2, 0, fileSize);
    let before = await io.readAt(123, 4, true);
    await io.writeAt(123, new Uint8Array([1, 2, 3, 4]));
    let after = await io.readAt(123, 4, true);
    expect(before).not.toEqual(after);
    expect(after).toEqual(new Uint8Array([1, 2, 3, 4]));
});

test('Extend file on write beyond buffer size', async () => {
    let io = new NodeFileIO(file3, 0, fileSize);
    await io.writeAt(1024, new Uint8Array([1, 2, 3, 4]));
    let result = await io.readAt(1024, 4, true);
    expect(result).toEqual(new Uint8Array([1, 2, 3, 4]));
    expect(io.byteLength).toBe(1028);
});
