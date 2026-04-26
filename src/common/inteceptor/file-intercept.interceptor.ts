import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path/win32';

export function createFileInterceptor(fieldName: string, destination: string) {
  return FileInterceptor(fieldName, {
    storage: diskStorage({
      destination: destination,
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(
          null,
          `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
        );
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return cb(new Error('Unsupported file type'), false);
      }
      cb(null, true);
    },
  });
}
