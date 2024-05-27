import {DEFAULT_CHUNK_SIZE} from "../../Constants.js"
import AbstractDataProcessor from "../AbstractDataProcessor.js"

export default class NativeStreamDataProcessor extends AbstractDataProcessor {
    /** @type {?boolean} */ static supported = null;
    /** @type {?ReadableStream} */ stream = null;
    /** @type {?TransformStream} */ processor = null;
    /** @type {?ReadableStreamDefaultReader} */ streamReader = null;

    /**
     * @return {boolean}
     */
    static isSupported() {
        if (this.supported === null) {
            try {
                // noinspection JSUnresolvedFunction
                new CompressionStream('deflate-raw');
            } catch (e) {
                this.supported = false;
                return this.supported;
            }
            this.supported = true;
        }

        return this.supported;
    }

    /**
     * @inheritDoc
     */
    constructor(reader, createPreCrc = false, createPostCrc = false) {
        super(reader, createPreCrc, createPostCrc);
    }

    /**
     * @inheritDoc
     */
    async generate(length) {
        if(this.streamReader === null) {
            this.resetStreams();
        }
        let {value} = await this.streamReader.read();
        return value ?? null;
    }

    resetStreams() {
        this.processor = this.createProcessorStream();
        this.stream = new ReadableStream({
            pull: async (controller) => {
                let data = await this.getChunkFromReader(DEFAULT_CHUNK_SIZE);
                controller.enqueue(data);
                if (this.isEof()) {
                    controller.close();
                }
            }
        });
        this.streamReader = this.stream.pipeThrough(this.processor).getReader();
    }

    /**
     * @inheritDoc
     */
    async reset() {
        await super.reset();
        this.processor = null;
        this.stream = null;
        this.streamReader = null;
        return this;
    }

    /**
     * @return {TransformStream}
     * @abstract
     */
    createProcessorStream() {

    }
}
