import FallbackDataProcessor from "../FallbackDataProcessor.js"
import NativeDeflateDataProcessor from "../Native/NativeDeflateDataProcessor.js"
import FflateDeflateDataProcessor from "../Fflate/FflateDeflateDataProcessor.js"
import NodeDeflateDataProcessor from "../Node/NodeDeflateDataProcessor.js";

export default class DefaultDeflateDataProcessor extends FallbackDataProcessor {
    /**
     * @inheritDoc
     */
    static getDataProcessors() {
        return [
            NativeDeflateDataProcessor,
            NodeDeflateDataProcessor,
            FflateDeflateDataProcessor
        ];
    }
}
