import type { Request, Response } from 'express';
import { uploadToS3 } from '../utils/awsS3';
import 'dotenv/config';

export const uploadMedia = async (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return
    }

    try {
        console.log('Uploading file to S3...');
        const fileUrl = await uploadToS3(req.file, process.env.AWS_S3_BUCKET_NAME!);
        res.status(200).json({ message: 'File uploaded successfully', fileUrl });
    } catch (error) {
        res.status(500).json({ message: 'Failed to upload file', error });
    }
};
