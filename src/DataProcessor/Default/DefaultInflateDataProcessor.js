import FallbackDataProcessor from "../FallbackDataProcessor.js"
import NativeInflateDataProcessor from "../Native/NativeInflateDataProcessor.js"
import FflateInflateDataProcessor from "../Fflate/FflateInflateDataProcessor.js"
import NodeInflateDataProcessor from "../Node/NodeInflateDataProcessor.js";

export default class DefaultInflateDataProcessor extends FallbackDataProcessor {
    /**
     * @inheritDoc
     */
    static getDataProcessors() {
        return [
            NativeInflateDataProcessor,
            NodeInflateDataProcessor,
            FflateInflateDataProcessor
        ];
    }
}
