import { UploadApiResponse } from "cloudinary";
import { NextFunction, Request, Response } from "express";
import multer from "multer";

import cloudinary from "../config/cloudinary_config";

// * Deklarasi tipe untuk Cloudinary response
declare global {
  namespace Express {
    namespace Multer {
      interface File {
        cloudinary?: UploadApiResponse;
      }
    }
  }
}

const storage = multer.memoryStorage();
const upload = multer({ storage });

// * Fungsi Upload ke Cloudinary
const uploadToCloudinary = async (
  buffer: Buffer,
  folder = "default_folder",
  filename?: string,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename,
        transformation: [
          {
            width: 800,
            height: 800,
            crop: "limit",
          },
          {
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        if (result) return resolve(result);
      },
    );
    uploadStream.end(buffer);
  });
};

// * Middleware untuk Single File (Opsional)
const uploadSingle =
  (fieldName: string, folder?: string) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const singleUpload = upload.single(fieldName);
    singleUpload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(500).json({ error: "Internal server error" });
      }

      try {
        // Jika ada file, upload ke Cloudinary
        if (req.file) {
          const result = await uploadToCloudinary(
            req.file.buffer,
            folder,
            req.file.originalname.split(".")[0],
          );
          req.file.cloudinary = result;
        }
        next();
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });
  };

// * Middleware untuk Multiple Files (Opsional)
const uploadArray =
  (fieldName: string, maxCount: number, folder?: string) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const arrayUpload = upload.array(fieldName, maxCount);
    arrayUpload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(500).json({ error: "Internal server error" });
      }

      try {
        // Jika ada files, upload ke Cloudinary
        if (req.files && req.files instanceof Array && req.files.length > 0) {
          const results = await Promise.all(
            req.files.map((file) =>
              uploadToCloudinary(
                file.buffer,
                folder,
                file.originalname.split(".")[0],
              ),
            ),
          );
          req.files.forEach((file, index) => {
            file.cloudinary = results[index];
          });
        }
        next();
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });
  };

// * Middleware untuk Upload Fields (Opsional)
const uploadFields =
  (fields: { name: string; maxCount?: number }[], folder?: string) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const fieldsUpload = upload.fields(fields);
    fieldsUpload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(500).json({ error: "Internal server error" });
      }

      try {
        if (req.files && req.files instanceof Object) {
          const uploadPromises: Promise<UploadApiResponse>[] = [];

          for (const field of fields) {
            const files = (req.files as Record<string, Express.Multer.File[]>)[
              field.name
            ];

            if (files && files.length > 0) {
              uploadPromises.push(
                ...files.map((file) =>
                  uploadToCloudinary(
                    file.buffer,
                    folder,
                    file.originalname.split(".")[0],
                  ),
                ),
              );
            }
          }

          if (uploadPromises.length > 0) {
            const results = await Promise.all(uploadPromises);

            for (const field of fields) {
              const files = (
                req.files as Record<string, Express.Multer.File[]>
              )[field.name];

              if (files && files.length > 0) {
                files.forEach((file, index) => {
                  file.cloudinary = results.shift();
                });
              }
            }
          }
        }
        next();
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });
  };

export { uploadArray, uploadFields, uploadSingle };
