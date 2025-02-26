export interface FileHashes {
    md5: string;
    sha1: string;
    sha256: string;
}

export interface CustodyInfo {
    uploadedBy: string;
    uploadTimestamp: string;
    lastModified: string;
    custodyDetails?: string;
}

export interface ProcessingRecord {
    timestamp: string;
    action: string;
    performer: string;
    details?: string;
}