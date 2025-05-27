import multer from 'multer';
import fs from 'fs';
import path from 'path';

const imageDir = './uploads/images';
const voiceDir = './uploads/voices';

if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });
if (!fs.existsSync(voiceDir)) fs.mkdirSync(voiceDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'images') cb(null, imageDir);
    else if (file.fieldname === 'voice') cb(null, voiceDir);
    else cb(new Error('Unknown file field'), null);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Optional: max 10MB
});

export const userRequestUpload = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'voice', maxCount: 1 },
]);
