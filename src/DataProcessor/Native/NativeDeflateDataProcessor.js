import NativeStreamDataProcessor from "./NativeStreamDataProcessor.js"

export default class NativeDeflateDataProcessor extends NativeStreamDataProcessor {
    /**
     * @inheritDoc
     */
    createProcessorStream() {
        // noinspection JSUnresolvedFunction
        return new CompressionStream('deflate-raw');
    }
}
