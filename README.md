# armarius-io

## About

This module contains implementations for reading from and writing to files, as well as implementations for 
deflate compression using various JavaScript APIs.
It is mainly used by the [armarius](https://github.com/aternosorg/armarius/) module.

Contained are IO contexts for Blob object (read only), ArrayBuffers, and Node.js FileHandle objects. 
Compression contexts exist for the [CompressionStreams API](https://developer.mozilla.org/en-US/docs/Web/API/CompressionStream),
the Node.js zlib module, and the fflate library.

## Installation

Armarius-IO can be installed using npm:

```shell
npm install armarius-io
```

## Usage

### IO contexts

IO contexts are objects that extend the `IO` class and can be used to read from or write to an underlying file or buffer.
This library contains the following IO contexts:
 * `ArrayBufferIO` - for reading from and writing to an ArrayBuffer
 * `BlobIO` - for reading from a Blob or JavaScript File object
 * `NodeFileIO` - for reading from and writing to a Node.js FileHandle object

#### ArrayBufferIO

```javascript
let data = new Uint8Array(123);
let io = new ArrayBufferIO(data.buffer, data.byteOffset, data.byteLength);
```

#### BlobIO

```javascript
let file = input.files[0];
let io = new BlobIO(file);
```

#### NodeFileIO

```javascript
let file = await fs.promises.open('file.txt', 'r+');
let stat = await file.stat();
let io = new NodeFileIO(file, 0, stat.size);
```

### DataStreams

DataStream objects can be used to read data from a source. All IO contexts also implement `DataStream`.

### DataProcessors

DataProcessor objects read and transform data from a `DataStream`. This library includes DataProcessors for deflate compression using various JavaScript APIs.

 * `NativeDeflateDataProcessor` and `NativeInflateDataProcessor` - for using the [CompressionStreams API](https://developer.mozilla.org/en-US/docs/Web/API/CompressionStream)
 * `NodeDeflateDataProcessor` and `NodeInflateDataProcessor` - for using the Node.js zlib module
 * `FflateDeflateDataProcessor` and `FflateInflateDataProcessor` - for using the fflate library
 * `DefaultDeflateDataProcessor` and `DefaultInflateDataProcessor` - for using the best available compression method



