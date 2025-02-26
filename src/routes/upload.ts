import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { MetadataService } from '../services/metadataService';
import { PinataService } from '../services/pinataService';
import { getRepository } from 'typeorm';
import { File } from '../models/File';

const router = Router();
const metadataService = new MetadataService();
const pinataService = new PinataService();

// Define upload directory
const UPLOAD_DIR = './uploads';

// Ensure upload directory exists
import fs from 'fs';
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});

// Add file filter to multer
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Add your file type restrictions here
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, PDF, and TXT files are allowed.'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

interface UploadRequestBody {
    description: string;
    culpritName: string;
    custodyDetails: string;
}

router.post('/upload',
    upload.single('file'),
    async (req: Request, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'No file uploaded'
                });
            }

            const { description, culpritName, custodyDetails } = req.body as UploadRequestBody;

            // Validate required fields
            if (!description || !culpritName || !custodyDetails) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields'
                });
            }

            const timestamp = new Date().toISOString();
            const handler = req.user?.username || 'anonymous';

            // Write metadata to file
            await metadataService.writeMetadata(req.file.path, {
                description,
                culpritName,
                custodyDetails,
                timestamp,
                handler
            });

            // Upload to IPFS
            const ipfsCid = await pinataService.uploadFile(req.file.path, {
                fileName: req.file.originalname,
                description,
                culpritName,
                timestamp
            });

            // Save to database
            const fileRepository = getRepository(File);
            const fileEntity = fileRepository.create({
                fileName: req.file.originalname,
                ipfsCid,
                description,
                culpritName,
                custodyDetails,
                fileSize: req.file.size,
                mimeType: req.file.mimetype
            });

            await fileRepository.save(fileEntity);

            // Clean up the local file after successful upload
            fs.promises.unlink(req.file.path)
                .catch(err => console.error('Error deleting local file:', err));

            res.json({
                success: true,
                ipfsCid,
                fileDetails: {
                    name: req.file.originalname,
                    size: req.file.size,
                    uploadedBy: handler,
                    uploadedAt: timestamp,
                    metadata: await metadataService.readMetadata(req.file.path)
                }
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'File upload failed'
            });
        }
    }
);

// Add a route to get all files
router.get('/files', async (req: Request, res: Response) => {
    try {
        const fileRepository = getRepository(File);
        const files = await fileRepository.find({
            order: {
                createdAt: 'DESC'
            }
        });

        res.json({
            success: true,
            files
        });
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch files'
        });
    }
});

export default router;