import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { HttpException, HttpStatus } from '@nestjs/common';

export const multerOptions = {
  storage: diskStorage({
    destination: (req: any, file: any, done: any) => {
      const uploadPath = 'src/assets/uploads';
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath);
      }
      done(null, uploadPath);
    },
    filename: (req: any, file: any, done: any) => {
      done(null, `${uuid()}${extname(file.originalname)}`);
    },
  }),
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB
  },
  fileFilter: (req: any, file: any, done: any) => {
    const type = extname(file.originalname);

    if (
      type === '.png' ||
      type === '.jpg' ||
      type === '.jpeg' ||
      type === '.gif'
    ) {
      done(null, true);
    } else {
      done(
        new HttpException(
          `Unsupported file type ${extname(file.originalname)}`,
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
  },
};
