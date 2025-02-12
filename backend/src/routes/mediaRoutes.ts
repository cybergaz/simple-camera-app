import express from 'express';
import { upload } from '../utils/multerConfig';
import { uploadMedia } from '../controllers/mediaControllers';

const router = express.Router();

router.post('/upload', upload.single('media'), uploadMedia);

export { router as mediaRoutes };
