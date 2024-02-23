import AbstractDataProcessor from "./AbstractDataProcessor.js"

export default class PassThroughDataProcessor extends AbstractDataProcessor {
    /** @type {boolean} */ eof = false;

    /**
     * @inheritDoc
     */
    async generate(length) {
        if (this.isEof()) {
            return null;
        }

        return await this.getChunkFromReader(length);
    }
}

