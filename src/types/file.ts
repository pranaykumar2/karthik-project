import { ExtractedMetadata } from '../services/metadataService';

export interface FileUploadData {
    fileName: string;
    ipfsCid: string;
    description: string;
    culpritName: string;
    custodyDetails: string;
    fileSize: number;
    mimeType: string;
    metadata: ExtractedMetadata;
    uploadedBy: string;
    uploadedAt: string;
}

export interface FileSearchResult {
    id: number;
    fileName: string;
    ipfsCid: string;
    description: string;
    culpritName: string;
    custodyDetails: string;
    fileSize: number;
    mimeType: string;
    metadata: ExtractedMetadata;
    uploadedBy: string;
    uploadedAt: string;
    createdAt: string;
    updatedAt: string;
}