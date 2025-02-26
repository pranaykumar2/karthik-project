interface FileRecord {
    fileName: string;
    ipfsCid: string;
    description: string;
    culpritName: string;
    custodyDetails: string;
    uploadedAt: string;
    size: number;
}

export class FileStore {
    private static files: FileRecord[] = [];

    static addFile(file: FileRecord): void {
        FileStore.files.push(file);
    }

    static getFiles(): FileRecord[] {
        return FileStore.files;
    }
}