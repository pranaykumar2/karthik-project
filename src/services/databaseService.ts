import pool from '../config/database';
import { FileMetadata, CREATE_TABLE_QUERY } from '../models/FileMetadata';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { ExtractedMetadata } from './metadataService';

export class DatabaseService {
    static async initialize() {
        try {
            const connection = await pool.getConnection();
            await connection.query(CREATE_TABLE_QUERY);
            connection.release();
            console.log('Database table initialized successfully');
        } catch (error) {
            console.error('Error initializing database:', error);
            throw error;
        }
    }

    static async saveFileMetadata(fileData: {
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
    }): Promise<number> {
        const connection = await pool.getConnection();
        try {
            const [result] = await connection.query<ResultSetHeader>(
                `INSERT INTO file_metadata (
                    fileName, ipfsCid, description, culpritName,
                    custodyDetails, fileSize, mimeType, metadata,
                    uploadedBy, uploadedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    fileData.fileName,
                    fileData.ipfsCid,
                    fileData.description,
                    fileData.culpritName,
                    fileData.custodyDetails,
                    fileData.fileSize,
                    fileData.mimeType,
                    JSON.stringify(fileData.metadata),
                    fileData.uploadedBy,
                    fileData.uploadedAt
                ]
            );
            return result.insertId;
        } finally {
            connection.release();
        }
    }

    static async getAllFiles(): Promise<FileMetadata[]> {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query<(FileMetadata & RowDataPacket)[]>(
                `SELECT * FROM file_metadata ORDER BY uploadedAt DESC`
            );
            return rows;
        } finally {
            connection.release();
        }
    }

    static async getFileByIpfsCid(ipfsCid: string): Promise<FileMetadata | null> {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query<(FileMetadata & RowDataPacket)[]>(
                'SELECT * FROM file_metadata WHERE ipfsCid = ?',
                [ipfsCid]
            );
            return rows[0] || null;
        } finally {
            connection.release();
        }
    }

    static async searchFiles(query: string): Promise<FileMetadata[]> {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query<(FileMetadata & RowDataPacket)[]>(
                `SELECT * FROM file_metadata 
                WHERE fileName LIKE ? 
                OR description LIKE ? 
                OR culpritName LIKE ?
                ORDER BY uploadedAt DESC`,
                [`%${query}%`, `%${query}%`, `%${query}%`]
            );
            return rows;
        } finally {
            connection.release();
        }
    }

    static async updateMetadata(ipfsCid: string, updates: Partial<FileMetadata>): Promise<boolean> {
        const connection = await pool.getConnection();
        try {
            const [result] = await connection.query<ResultSetHeader>(
                `UPDATE file_metadata SET ? WHERE ipfsCid = ?`,
                [updates, ipfsCid]
            );
            return result.affectedRows > 0;
        } finally {
            connection.release();
        }
    }

    static async deleteFile(ipfsCid: string): Promise<boolean> {
        const connection = await pool.getConnection();
        try {
            const [result] = await connection.query<ResultSetHeader>(
                'DELETE FROM file_metadata WHERE ipfsCid = ?',
                [ipfsCid]
            );
            return result.affectedRows > 0;
        } finally {
            connection.release();
        }
    }
}