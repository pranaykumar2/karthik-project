export interface PinataMetadata {
    name: string;
    keyvalues: {
        description: string;
        culpritName: string;
        uploadTimestamp: string;
        uploadedBy: string;
        uploadDate: string;
        [key: string]: string;
    };
}

export interface PinataOptions {
    cidVersion: 0 | 1;
    wrapWithDirectory?: boolean;
    customPinPolicy?: {
        regions: Array<{
            id: string;
            desiredReplicationCount: number;
        }>;
    };
}

export interface PinataResponse {
    IpfsHash: string;
    PinSize: number;
    Timestamp: string;
    status: string;
    metadata: PinataMetadata;
}

export interface PinataFile {
    fileName: string;
    description: string;
    culpritName: string;
    timestamp: string;
}

export interface PinataError extends Error {
    status?: number;
    response?: {
        data?: any;
        status: number;
        statusText: string;
    };
}