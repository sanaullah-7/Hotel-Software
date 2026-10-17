import { Router } from 'express';
import multer from 'multer';
import * as fileController from './file.controller.js';
import authMiddleware from '../../../middlewares/auth.middleware.js';
import hotelContext from '../../../middlewares/hotelContext.middleware.js';

// Multer memory storage (keeps file in memory buffer up to 15MB)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max file size
  },
});

const router = Router();

router.use(authMiddleware);
router.use(hotelContext);

router.post('/files/upload', upload.single('file'), fileController.uploadFile);
router.get('/files/:id', fileController.getFileById);

export default router;
