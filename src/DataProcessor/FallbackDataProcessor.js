import DataProcessor from "./DataProcessor.js"

export default class FallbackDataProcessor extends DataProcessor {
    /** @type {DataProcessor} */ dataProcessor;

    /**
     * @abstract
     * @return {(typeof DataProcessor)[]}
     */
    static getDataProcessors() {
        return [];
    }

    /**
     * @inheritDoc
     */
    constructor(reader, createPreCrc = false, createPostCrc = false) {
        super();

        let lastError;
        for (let Processor of this.constructor.getDataProcessors()) {
            if (!Processor.isSupported()) {
                continue;
            }
            try {
                this.dataProcessor = new Processor(reader, createPreCrc, createPostCrc);
            } catch (e) {
                lastError = e;
                continue;
            }
            break;
        }

        if (!this.dataProcessor) {
            throw (lastError || new Error('Failed to find working DataProcessor'));
        }
    }

    /**
     * @inheritDoc
     */
    async generate(length) {
        return Promise.resolve(undefined);
    }

    /**
     * @inheritDoc
     */
    async read(length) {
        return await this.dataProcessor.read(length);
    }

    /**
     * @inheritDoc
     */
    getPreCrc() {
        return this.dataProcessor.getPreCrc();
    }

    /**
     * @inheritDoc
     */
    getPostCrc() {
        return this.dataProcessor.getPostCrc();
    }

    /**
     * @inheritDoc
     */
    getPreLength() {
        return this.dataProcessor.getPreLength();
    }

    /**
     * @inheritDoc
     */
    getPostLength() {
        return this.dataProcessor.getPostLength();
    }

    /**
     * @inheritDoc
     */
    async reset() {
        await this.dataProcessor.reset();
        return this;
    }
}
