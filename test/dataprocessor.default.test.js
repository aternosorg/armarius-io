import {expect, test} from '@jest/globals';
import {randomBytes} from "node:crypto";
import {deflate, inflate, processData} from "./util.js";
import {
    BigInt,
    CRC32,
    DefaultDeflateDataProcessor,
    DefaultInflateDataProcessor, NativeDeflateDataProcessor,
    NativeInflateDataProcessor,
    NodeDeflateDataProcessor,
    NodeInflateDataProcessor,
} from "../index.js";

const rawBytes = randomBytes(1024);
const bytes = new Uint8Array(rawBytes.buffer, rawBytes.byteOffset, rawBytes.byteLength);

test('Deflate data', async () => {
    let {result, dataProcessor} = await processData(bytes, DefaultDeflateDataProcessor);
    let inflated = await inflate(result);
    expect(inflated).toEqual(bytes);
    expect(dataProcessor.dataProcessor instanceof NodeDeflateDataProcessor || dataProcessor.dataProcessor instanceof NativeDeflateDataProcessor)
        .toBeTruthy();
    expect(dataProcessor.getPreCrc().finish()).toBe(CRC32.hash(bytes));
    expect(dataProcessor.getPreLength()).toBe(BigInt(bytes.byteLength));
    expect(dataProcessor.getPostCrc().finish()).toBe(CRC32.hash(result));
    expect(dataProcessor.getPostLength()).toBe(BigInt(result.byteLength));
});

test('Inflate data', async () => {
    let deflated = await deflate(bytes);
    let {result, dataProcessor} = await processData(deflated, DefaultInflateDataProcessor);
    expect(result).toEqual(bytes);
    expect(dataProcessor.dataProcessor instanceof NodeInflateDataProcessor || dataProcessor.dataProcessor instanceof NativeInflateDataProcessor)
        .toBeTruthy();
    expect(dataProcessor.getPreCrc().finish()).toBe(CRC32.hash(deflated));
    expect(dataProcessor.getPreLength()).toBe(BigInt(deflated.byteLength));
    expect(dataProcessor.getPostCrc().finish()).toBe(CRC32.hash(bytes));
    expect(dataProcessor.getPostLength()).toBe(BigInt(bytes.byteLength));
});
