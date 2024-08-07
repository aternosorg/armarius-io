import FflateDataProcessor from "./FflateDataProcessor.js";
import {Deflate} from "fflate";

export default class FflateDeflateDataProcessor extends FflateDataProcessor {
    /**
     * @inheritDoc
     */
    initFflate() {
        this.flate = new Deflate();
        this.flate.ondata = this.onData.bind(this);
    }

    /**
     * @inheritDoc
     */
    push(data, final) {
        super.push(data, final);
        if (!final) {
            this.flate.flush();
        }
    }
}

