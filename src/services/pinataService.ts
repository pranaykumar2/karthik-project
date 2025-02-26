import PinataSDK from '@pinata/sdk';
import fs from 'fs';
import { Readable } from 'stream';

export class PinataService {
    private pinata: any;

    constructor() {
        const apiKey = process.env.PINATA_API_KEY;
        const apiSecret = process.env.PINATA_SECRET_KEY;

        if (!apiKey || !apiSecret) {
            throw new Error('Pinata API credentials not found in environment variables');
        }

        this.pinata = new PinataSDK(apiKey, apiSecret);
    }

    async testAuthentication(): Promise<boolean> {
        try {
            await this.pinata.testAuthentication();
            return true;
        } catch (error) {
            console.error('Pinata authentication failed:', error);
            return false;
        }
    }

    async uploadFile(filePath: string, metadata: {
        fileName: string;
        description: string;
        culpritName: string;
        timestamp: string;
    }): Promise<string> {
        let readableStream: Readable | null = null;
        try {
            readableStream = fs.createReadStream(filePath);

            const options = {
                pinataMetadata: {
                    name: metadata.fileName,
                    keyvalues: {
                        description: metadata.description,
                        culpritName: metadata.culpritName,
                        uploadTimestamp: metadata.timestamp,
                        uploadedBy: 'pranaykumar2', // Using the provided user login
                        uploadDate: '2025-02-26 12:59:38' // Using the provided UTC time
                    }
                },
                pinataOptions: {
                    cidVersion: 1
                }
            };

            const result = await this.pinata.pinFileToIPFS(readableStream, options);
            return result.IpfsHash;
        } catch (error) {
            console.error('Error uploading to IPFS:', error);
            throw new Error('Failed to upload file to IPFS');
        } finally {
            // Safely close the stream if it exists
            if (readableStream) {
                readableStream.destroy();
            }
        }
    }

    async retrieveFileMetadata(ipfsHash: string): Promise<any> {
        try {
            const metadata = await this.pinata.pinList({
                hashContains: ipfsHash,
                status: 'pinned'
            });

            if (!metadata.rows || metadata.rows.length === 0) {
                throw new Error('No metadata found for the given IPFS hash');
            }

            return metadata.rows[0];
        } catch (error) {
            console.error('Error retrieving file metadata:', error);
            throw new Error('Failed to retrieve file metadata from Pinata');
        }
    }

    async unpinFile(ipfsHash: string): Promise<boolean> {
        try {
            await this.pinata.unpin(ipfsHash);
            return true;
        } catch (error) {
            console.error('Error unpinning file:', error);
            throw new Error('Failed to unpin file from Pinata');
        }
    }

    // Helper method to validate file before upload
    private validateFile(filePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.access(filePath, fs.constants.F_OK | fs.constants.R_OK, (err) => {
                if (err) {
                    reject(new Error('File does not exist or is not readable'));
                } else {
                    resolve();
                }
            });
        });
    }
}