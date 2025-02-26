import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { MetadataService } from '../services/metadataService';
import { PinataService } from '../services/pinataService';
import { FileStore } from '../services/fileStore';

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

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const { description, culpritName, custodyDetails } = req.body;

        if (!description || !culpritName || !custodyDetails) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        const timestamp = new Date().toISOString();

        // Upload to IPFS
        const ipfsCid = await pinataService.uploadFile(req.file.path, {
            fileName: req.file.originalname,
            description,
            culpritName,
            timestamp
        });

        // Store file information
        FileStore.addFile({
            fileName: req.file.originalname,
            ipfsCid,
            description,
            culpritName,
            custodyDetails,
            uploadedAt: timestamp,
            size: req.file.size
        });

        // Clean up the local file
        fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting local file:', err);
        });

        res.json({
            success: true,
            ipfsCid,
            fileDetails: {
                name: req.file.originalname,
                size: req.file.size,
                uploadedAt: timestamp
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'File upload failed'
        });
    }
});

router.get('/files', (req: Request, res: Response) => {
    try {
        const files = FileStore.getFiles();
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