import FflateDataProcessor from "./FflateDataProcessor.js";
import {Inflate} from "fflate";

export default class FflateInflateDataProcessor extends FflateDataProcessor {
    /**
     * @inheritDoc
     */
    initFflate() {
        this.flate = new Inflate();
        this.flate.ondata = this.onData.bind(this);
    }

    /**
     * @inheritDoc
     */
    push(data, final) {
        super.push(data, false);
    }
}

