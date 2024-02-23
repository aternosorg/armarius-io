import {ArrayBufferIO, BufferUtils} from "../index.js";
import {constants} from "../index.js";
import * as zlib from "node:zlib";

/**
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @param {Uint8Array|Buffer} data
 * @param {typeof DataProcessor} DataProcessor
 * @return {Promise<{result: (Uint8Array), dataProcessor: (DataProcessor)}>}
 */
export async function processData(data, DataProcessor) {
    let chunks = [];
    let io = new ArrayBufferIO(data.buffer, data.byteOffset, data.byteLength);
    let processor = new DataProcessor(io, true, true);
    let chunk;
    while ((chunk = await processor.read(constants.DEFAULT_CHUNK_SIZE)) !== null) {
        chunks.push(chunk);
    }
    let result = BufferUtils.concatBuffers(chunks);
    return {
        result,
        dataProcessor: processor
    };
}

/**
 * @param {Uint8Array|Buffer} data
 * @return {Promise<Uint8Array>}
 */
export function inflate(data) {
    return new Promise((resolve, reject) => {
        zlib.inflateRaw(data, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(new Uint8Array(result.buffer, result.byteOffset, result.byteLength));
            }
        });
    });
}

/**
 * @param {Uint8Array|Buffer} data
 * @return {Promise<Uint8Array>}
 */
export function deflate(data) {
    return new Promise((resolve, reject) => {
        zlib.deflateRaw(data, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(new Uint8Array(result.buffer, result.byteOffset, result.byteLength));
            }
        });
    });
}
