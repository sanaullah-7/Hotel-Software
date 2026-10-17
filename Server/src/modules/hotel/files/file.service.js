import { v2 as cloudinary } from 'cloudinary';
import { getModel } from '../../../database/hotel/modelFactory.js';
import ApiError from '../../../utils/apiError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

export const configureCloudinary = () => {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (cloud_name && api_key && api_secret) {
    cloudinary.config({
      cloud_name,
      api_key,
      api_secret,
      secure: true,
    });
    return true;
  }
  return false;
};

export const isCloudinaryConfigured = () => configureCloudinary();

/**
 * Uploads a file buffer either directly to Cloudinary (Primary)
 * or to tenant GridFS (Fallback).
 */
export const uploadFile = async (hotelContext, file, meta = {}) => {
  if (!file || !file.buffer) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'No file buffer provided for upload');
  }

  const FileRecord = await getModel(hotelContext, 'FileRecord');
  const hotelId = hotelContext?.hotelId || 'default';
  const folder = `hotel_pms/${hotelId}/${meta.folder || 'documents'}`;

  // Primary: Cloudinary
  if (isCloudinaryConfigured()) {
    try {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(file.buffer);
      });

      const fileRecord = await FileRecord.create({
        file_name: uploadResult.original_filename || file.originalname,
        original_name: file.originalname,
        mime_type: file.mimetype,
        size_bytes: file.size || uploadResult.bytes,
        storage_provider: 'CLOUDINARY',
        storage_key: uploadResult.public_id,
        storage_url: uploadResult.secure_url || uploadResult.url,
        entity_ref: meta.entity_ref || 'DOCUMENT',
        entity_id: meta.entity_id || null,
        uploaded_by: meta.uploaded_by || null,
      });

      return fileRecord;
    } catch (err) {
      console.warn('[CLOUDINARY_UPLOAD_FALLBACK]', err.message);
      // If Cloudinary fails, fall through to GridFS fallback
    }
  }

  // Fallback: MongoDB GridFS bound to hotelContext connection
  const conn = hotelContext?.db || hotelContext?.connection;
  if (!conn) {
    throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'No database connection available for file storage');
  }

  const mongooseModule = await import('mongoose');
  const GridFSBucket = mongooseModule.default.mongo.GridFSBucket;
  const bucket = new GridFSBucket(conn.db || conn, { bucketName: 'hotel_files' });

  const filename = `${Date.now()}-${file.originalname}`;
  const uploadStream = bucket.openUploadStream(filename, {
    contentType: file.mimetype,
    metadata: {
      original_name: file.originalname,
      entity_ref: meta.entity_ref,
      hotel_id: hotelId,
    },
  });

  await new Promise((resolve, reject) => {
    uploadStream.on('finish', resolve);
    uploadStream.on('error', reject);
    uploadStream.end(file.buffer);
  });

  const storageUrl = `/api/v1/hotel/files/${uploadStream.id}`;

  const fileRecord = await FileRecord.create({
    file_name: filename,
    original_name: file.originalname,
    mime_type: file.mimetype,
    size_bytes: file.size,
    storage_provider: 'GRIDFS',
    storage_key: String(uploadStream.id),
    storage_url: storageUrl,
    entity_ref: meta.entity_ref || 'DOCUMENT',
    entity_id: meta.entity_id || null,
    uploaded_by: meta.uploaded_by || null,
  });

  return fileRecord;
};

export const getFileById = async (hotelContext, fileId) => {
  const FileRecord = await getModel(hotelContext, 'FileRecord');
  const fileRecord = await FileRecord.findById(fileId);
  if (!fileRecord) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'File record not found');
  }
  return fileRecord;
};
