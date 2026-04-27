export default class BlobMapFileSystem {
    /** @type {Map<string, ?Blob>} */ blobMap;

    /**
     * @param {Iterable<File>} files
     */
    static fromFiles(files) {
        let blobMap = new Map();
        for (let file of files) {
            let path = file.webkitRelativePath || file.relativePath || file.name;
            blobMap.set(path, file);
            let parts = path.split('/');
            parts.pop();
            while (parts.length > 0) {
                let dirPath = parts.join('/');
                if (!blobMap.has(dirPath)) {
                    blobMap.set(dirPath, null);
                }
                parts.pop();
            }
        }
    }

    constructor(blobMap) {
        this.blobMap = blobMap;
    }
}
