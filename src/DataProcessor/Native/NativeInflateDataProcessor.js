import NativeStreamDataProcessor from "./NativeStreamDataProcessor.js"

export default class NativeInflateDataProcessor extends NativeStreamDataProcessor {
    /**
     * @inheritDoc
     */
    createProcessorStream() {
        // noinspection JSUnresolvedFunction
        return new DecompressionStream('deflate-raw');
    }
}
