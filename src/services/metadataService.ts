import { exiftool, Tags } from 'exiftool-vendored';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import path from "path";

export interface ExtractedMetadata {
    basic: {
        fileName: string;
        fileSize: number | undefined;
        fileType: string | undefined;
        mimeType: string | undefined;
        created: string | undefined;
        modified: string | undefined;
    };
    technical: {
        imageWidth?: number;
        imageHeight?: number;
        colorSpace?: string;
        compression?: string;
        resolution?: string;
        bitDepth?: number;
        [key: string]: any;
    };
    forensic: {
        hash: {
            md5: string;
            sha1: string;
            sha256: string;
        };
        author?: string;
        software?: string;
        device?: string;
        processingHistory: string[];
    };
    custody: {
        uploadedBy: string;
        uploadTimestamp: string;
        lastModified: string;
    };
}

export class MetadataService {
    async extractMetadata(filePath: string): Promise<ExtractedMetadata> {
        try {
            // Get exiftool metadata
            const tags: Tags = await exiftool.read(filePath);

            // Calculate file hashes
            const fileBuffer = await fs.readFile(filePath);
            const hashes = this.calculateHashes(fileBuffer);

            // Current timestamp in UTC
            const currentTime = '2025-02-26 17:46:44';


            // @ts-ignore
            const metadata: ExtractedMetadata = {
                basic: {
                    fileName: tags.FileName || path.basename(filePath),
                    fileSize: tags.FileSize,
                    fileType: tags.FileType,
                    mimeType: tags.MIMEType,
                    created: tags.CreateDate?.toString(),
                    modified: tags.ModifyDate?.toString()
                },
                technical: {
                    imageWidth: tags.ImageWidth,
                    imageHeight: tags.ImageHeight,
                    colorSpace: tags.ColorSpace?.toString(),
                    compression: tags.Compression?.toString(),
                    resolution: this.formatResolution(tags),
                    bitDepth: tags.BitDepth
                },
                forensic: {
                    hash: hashes,
                    author: tags.Author?.toString(),
                    software: tags.Software?.toString(),
                    device: tags.Model?.toString() || tags.DeviceModel?.toString(),
                    processingHistory: []
                },
                custody: {
                    uploadedBy: 'pranaykumar2',
                    uploadTimestamp: currentTime,
                    lastModified: currentTime
                }
            };

            // Add processing record
            metadata.forensic.processingHistory.push(
                `File uploaded by ${metadata.custody.uploadedBy} at ${metadata.custody.uploadTimestamp}`
            );

            return metadata;
        } catch (error) {
            console.error('Error extracting metadata:', error);
            throw new Error('Failed to extract file metadata');
        }
    }

    private calculateHashes(buffer: Buffer) {
        return {
            md5: crypto.createHash('md5').update(buffer).digest('hex'),
            sha1: crypto.createHash('sha1').update(buffer).digest('hex'),
            sha256: crypto.createHash('sha256').update(buffer).digest('hex')
        };
    }

    private formatResolution(tags: Tags): string {
        const xRes = tags.XResolution;
        const yRes = tags.YResolution;
        if (xRes && yRes) {
            return `${xRes}x${yRes}`;
        }
        return 'Unknown';
    }

    async writeMetadata(filePath: string, metadata: any): Promise<void> {
        try {
            await exiftool.write(filePath, {
                'Comment': metadata.description,
                'UserComment': metadata.custodyDetails,
                'Artist': metadata.handler,
                'Software': 'Forensic File Management System',
                'ModifyDate': new Date().toISOString()
            });
        } catch (error) {
            console.error('Error writing metadata:', error);
            throw new Error('Failed to write metadata to file');
        }
    }

    async cleanup(): Promise<void> {
        await exiftool.end();
    }
}