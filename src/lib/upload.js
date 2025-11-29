import multer, { diskStorage } from 'multer';
import { extname as _extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

const uploadDir = './uploads';
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}

const createStorage = (prefix = 'file') => {
  return diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `${prefix}-${uniqueSuffix}${_extname(file.originalname)}`);
    }
  });
};

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(_extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan (jpeg, jpg, png, webp)'));
  }
};

const createUpload = (prefix = 'file') => {
  return multer({
    storage: createStorage(prefix),
    limits: {
      fileSize: 5 * 1024 * 1024
    },
    fileFilter: fileFilter
  });
};

export const productUpload = createUpload('product');
export const profileUpload = createUpload('profile');

export default productUpload;