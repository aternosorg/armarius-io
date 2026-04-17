import {afterEach, beforeEach, expect, test} from "@jest/globals";
import * as fs from "node:fs";
import * as os from "node:os";
import {NodeFileHandle} from "../index.js";
import {pathToFileURL} from "node:url";
import {asyncDispose} from "../src/Util/symbols.js";

let tempDir;
let baseFileHandle;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

beforeEach(async () => {
    tempDir = pathToFileURL(await fs.promises.mkdtemp(os.tmpdir() + '/armarius-test-'));
    baseFileHandle = new NodeFileHandle(tempDir);
});

afterEach(async () => {
    await fs.promises.rm(tempDir, {recursive: true, force: true});
});

test("Get child", async () => {
    let childHandle = await baseFileHandle.getChild("child/path/");
    expect(childHandle.url).toEqual(new URL("/child/path/", tempDir));
    expect(await childHandle.exists()).toBe(false);
});

test('Create child directory', async () => {
    let childHandle = await baseFileHandle.createChildDirectory("child/path/");
    expect(childHandle.url).toEqual(new URL("/child/path/", tempDir));
    expect(await childHandle.exists()).toBe(true);
    let stat = await childHandle.stat();
    expect(stat.isDirectory()).toBe(true);
});

test("Exists", async () => {
    expect(await baseFileHandle.exists()).toBe(true);
    let child = await baseFileHandle.getChild("child");
    expect(await child.exists()).toBe(false);
});

test("Get children", async () => {
    let child1 = await baseFileHandle.createChildDirectory("child1");
    let child2 = await baseFileHandle.createChildDirectory("child2");
    let children = [];
    for await (let child of baseFileHandle.getChildren()) {
        children.push(child);
    }
    expect(children.map(c => c.url)).toEqual([child1.url, child2.url]);
});

test("Open readable fails if not exists", async () => {
    let child = await baseFileHandle.getChild("child");
    await expect(child.open(true, false)).rejects.toThrow();
});

test("Open writable creates file", async () => {
    let child = await baseFileHandle.getChild("child");
    let fd = await child.open(false, true);
    await fd.write(textEncoder.encode("Hello, world!"));
    await fd[asyncDispose]();
    expect(await child.exists()).toBe(true);
    let stat = await child.stat();
    expect(stat.isFile()).toBe(true);
});

test("Open readable on existing file", async () => {
    let child = await baseFileHandle.getChild("child");
    let fd = await child.open(false, true);
    await fd.write(textEncoder.encode("Hello, world!"));
    await fd[asyncDispose]();

    let fd2 = await child.open(true, false);
    let data = await fd2.read(13);
    await fd2[asyncDispose]();
    expect(textDecoder.decode(data)).toBe("Hello, world!");
});

test("Open readable and writable", async () => {
    let child = await baseFileHandle.getChild("child");
    let fd = await child.open(true, true);
    await fd.write(textEncoder.encode("Hello, world!"));
    await fd.seek(0);
    let data = await fd.read(13);
    await fd[asyncDispose]();
    expect(textDecoder.decode(data)).toBe("Hello, world!");
});

test("Open directory fails", async () => {
    await expect(baseFileHandle.open(true, false)).rejects.toThrow();
});

test("Stat file", async () => {
    let child = await baseFileHandle.getChild("child");
    let fd = await child.open(false, true);
    await fd.write(textEncoder.encode("Hello, world!"));
    await fd[asyncDispose]();

    let stat = await child.stat();
    expect(stat.isFile()).toBe(true);
    expect(stat.isDirectory()).toBe(false);
    expect(stat.isSymbolicLink()).toBe(false);
    expect(stat.size).toBe(13);
});

test("Stat directory", async () => {
    let stat = await baseFileHandle.stat();
    expect(stat.isFile()).toBe(false);
    expect(stat.isDirectory()).toBe(true);
    expect(stat.isSymbolicLink()).toBe(false);
});
