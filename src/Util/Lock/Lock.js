import LockHandle from "./LockHandle.js";

export default class Lock {
    /** @type {Object[]} */ queue = [];
    /** @type {Set<Promise>} */ activeSharedLocks = new Set();
    /** @type {boolean} */ working = false;

    /**
     * @param {boolean} exclusive
     * @return {Promise<LockHandle>}
     */
    lock(exclusive) {
        return new Promise((resolve, reject) => {
            this.queue.push({ exclusive, resolve, reject });
            this.work();
        });
    }

    async work() {
        if (this.working) {
            return;
        }
        this.working = true;

        try {
            let entry;
            while (entry = this.queue.shift()) {
                if (entry.exclusive) {
                    await Promise.allSettled([...this.activeSharedLocks]);
                    let {handle, promise} = LockHandle.create();
                    entry.resolve(handle);
                    await promise.catch(() => {});
                    continue;
                }

                let {handle, promise} = LockHandle.create();
                this.activeSharedLocks.add(promise);
                promise.finally(() => {
                    this.activeSharedLocks.delete(promise);
                });
                entry.resolve(handle);
            }
        } finally {
            this.working = false;
            if (this.queue.length > 0) {
                this.work();
            }
        }
    }
}
