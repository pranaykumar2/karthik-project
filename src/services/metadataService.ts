import { exiftool } from 'exiftool-vendored';
import path from 'path';

interface ForensicMetadata {
    description: string;
    culpritName: string;
    custodyDetails: string;
    timestamp: string;
    handler: string;
}

export class MetadataService {
    async writeMetadata(filePath: string, metadata: ForensicMetadata): Promise<void> {
        try {
            await exiftool.write(filePath, {
                'Comment': metadata.description,
                'Subject': metadata.culpritName,
                'UserComment': metadata.custodyDetails,
                'CreateDate': metadata.timestamp,
                'Artist': metadata.handler
            });
        } catch (error) {
            console.error('Error writing metadata:', error);
            throw new Error('Failed to write metadata to file');
        }
    }

    async readMetadata(filePath: string): Promise<any> {
        try {
            const metadata = await exiftool.read(filePath);
            return metadata;
        } catch (error) {
            console.error('Error reading metadata:', error);
            throw new Error('Failed to read metadata from file');
        }
    }

    async cleanup(): Promise<void> {
        await exiftool.end();
    }
}