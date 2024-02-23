import NodeStreamDataProcessor from './NodeStreamDataProcessor.js';


export default class NodeInflateDataProcessor extends NodeStreamDataProcessor {
    /**
     * @inheritDoc
     */
    async initTransform() {
        let zlib = await this.constructor.getZlib();
        this.transform = zlib.createInflateRaw();
        this.transform.on('data', this.onData.bind(this));
    }
}
