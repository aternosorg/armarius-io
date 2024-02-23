import NodeStreamDataProcessor from './NodeStreamDataProcessor.js';

export default class NodeDeflateDataProcessor extends NodeStreamDataProcessor {
    /**
     * @inheritDoc
     */
    async initTransform() {
        let zlib = await this.constructor.getZlib();
        this.transform = zlib.createDeflateRaw();
        this.transform.on('data', this.onData.bind(this));
    }
}
