import multer from 'multer';
import path from 'path';
import type { Request } from 'express';

// import { fileURLToPath } from 'url';
//
// // Define __dirname equivalent in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
//
// // Define the storage location and filename
// const storage = multer.diskStorage({
//     destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
//         // Specify the folder where files will be stored
//         const uploadDir = path.join(__dirname, '../../../uploads/');
//         console.log(`Storing file in: ${uploadDir}`);
//         cb(null, uploadDir);
//     },
//     filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
//         // Generate a unique filename
//         const uniqueFilename = `${Date.now()}-${file.originalname}`;
//         console.log(`Generated filename: ${uniqueFilename}`);
//         cb(null, uniqueFilename);
//     },
// });
//
// // Create the Multer instance
// export const upload = multer({ storage });

const storage = multer.memoryStorage();

export const upload = multer({ storage });
