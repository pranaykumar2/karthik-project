import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { MetadataService } from '../services/metadataService';
import { PinataService } from '../services/pinataService';
import { DatabaseService } from '../services/databaseService';
import fs from 'fs';

const router = Router();
const metadataService = new MetadataService();
const pinataService = new PinataService();

// Define upload directory
const UPLOAD_DIR = './uploads';

// Ensure upload directory exists
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

        // Validate required fields
        if (!description || !culpritName || !custodyDetails) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Extract metadata using the updated MetadataService
        const extractedMetadata = await metadataService.extractMetadata(req.file.path);

        // Upload to IPFS
        const ipfsCid = await pinataService.uploadFile(req.file.path, {
            fileName: req.file.originalname,
            description,
            culpritName,
            timestamp: '2025-02-26 17:51:55'
        });

        // Prepare file data for database
        const fileData = {
            fileName: req.file.originalname,
            ipfsCid,
            description,
            culpritName,
            custodyDetails,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            metadata: extractedMetadata, // Now using the ExtractedMetadata type
            uploadedBy: 'pranaykumar2',
            uploadedAt: '2025-02-26 17:51:55'
        };

        // Save to database
        await DatabaseService.saveFileMetadata(fileData);

        // Clean up local file
        fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting local file:', err);
        });

        res.json({
            success: true,
            ipfsCid,
            fileDetails: {
                ...fileData,
                metadata: extractedMetadata
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

router.get('/files', async (req: Request, res: Response) => {
    try {
        const files = await DatabaseService.getAllFiles();
        res.json({ success: true, files });
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch files'
        });
    }
});

router.get('/metadata/:ipfsCid', async (req: Request, res: Response) => {
    try {
        const file = await DatabaseService.getFileByIpfsCid(req.params.ipfsCid);
        if (!file) {
            return res.status(404).json({
                success: false,
                error: 'File not found'
            });
        }

        // Parse the stored metadata string back to an object
        const metadata = typeof file.metadata === 'string'
            ? JSON.parse(file.metadata)
            : file.metadata;

        res.json({
            success: true,
            metadata
        });
    } catch (error) {
        console.error('Error fetching metadata:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch metadata'
        });
    }
});

// Add route for searching files
router.get('/search', async (req: Request, res: Response) => {
    try {
        const { query } = req.query;
        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Search query is required'
            });
        }

        const files = await DatabaseService.searchFiles(query);
        res.json({
            success: true,
            files
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search files'
        });
    }
});

export default router;