export interface FileMetadata {
    id?: number;
    fileName: string;
    ipfsCid: string;
    description: string;
    culpritName: string;
    custodyDetails: string;
    fileSize: number;
    mimeType: string;
    uploadedBy: string;
    uploadedAt: string;
    metadata: string; // JSON string of exiftool metadata
}

export const CREATE_TABLE_QUERY = `
    CREATE TABLE IF NOT EXISTS file_metadata (
                                                 id INT AUTO_INCREMENT PRIMARY KEY,
                                                 fileName VARCHAR(255) NOT NULL,
        ipfsCid VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        culpritName VARCHAR(255),
        custodyDetails TEXT,
        fileSize BIGINT,
        mimeType VARCHAR(100),
        metadata JSON,
        uploadedBy VARCHAR(100),
        uploadedAt DATETIME,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_ipfsCid (ipfsCid),
        INDEX idx_uploadedAt (uploadedAt)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;