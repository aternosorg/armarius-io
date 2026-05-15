import {asyncDispose} from "../symbols.js";

export default class LockHandle {
    /** @type {function} */ handleReturn;

    /**
     * @return {{handle: LockHandle, promise: Promise<unknown>}}
     */
    static create() {
        let handle;
        let promise = new Promise(resolve => {
            handle = new this(resolve);
        });
        return { handle, promise };
    }

    /**
     * @param {function} handleReturn
     */
    constructor(handleReturn) {
        this.handleReturn = handleReturn;
    }

    /**
     * @return {this}
     */
    release() {
        this.handleReturn();
        return this;
    }

    [asyncDispose] () {
        this.release();
    }
}
