export default class Path {
    /**
     * @param {string} path
     * @return {string}
     */
    static normalize(path) {
        const startSlash = path.startsWith('/');
        const endSlash = path.length > 1 && path.endsWith('/');

        const parts = path.split('/');
        const resolved = [];
        let unresolvedParentCount = 0;

        for (const part of parts) {
            if (part === '' || part === '.') {
                continue;
            }

            if (part === '..') {
                if (resolved.length > 0) {
                    resolved.pop();
                } else if (startSlash) {
                    throw new Error(`Cannot normalize absolute path above root: ${path}`);
                } else {
                    unresolvedParentCount++;
                }
                continue;
            }

            resolved.push(part);
        }

        const finalParts = startSlash
            ? resolved
            : new Array(unresolvedParentCount).fill('..').concat(resolved);

        let out;
        if (startSlash) {
            out = '/' + finalParts.join('/');
        } else {
            out = finalParts.length ? finalParts.join('/') : '.';
        }

        if (endSlash) {
            if (out === '.') {
                out = './';
            } else if (out !== '/') {
                out += '/';
            }
        }

        return out;
    }

    /**
     * @param {string} path
     * @returns {string}
     */
    static dirname(path) {
        let normalized = this.normalize(path.replace(/\/+$/, ""));
        let lastSlash = normalized.lastIndexOf('/');
        if (lastSlash === -1) {
            return '.';
        }
        if (lastSlash === 0) {
            return '/';
        }
        return normalized.substring(0, lastSlash);
    }

    /**
     * @param {string} path
     * @returns {string}
     */
    static basename(path) {
        let normalized = this.normalize(path.replace(/\/+$/, ""));
        let lastSlash = normalized.lastIndexOf('/');
        if (lastSlash === -1) {
            return normalized;
        }
        return normalized.substring(lastSlash + 1);
    }
}
