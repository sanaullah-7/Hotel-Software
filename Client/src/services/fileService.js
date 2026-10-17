import api from '../api/client.js';

export const fileService = {
  /**
   * Uploads a file/image to Cloudinary via backend multipart endpoint.
   * @param {File} file - Native browser File or Blob
   * @param {Object} options - { folder: 'guests'|'vehicles'|'branding'|'staff', entity_ref: '...' }
   * @returns {Promise<Object>} Returns { file_id, file_name, file_url, storage_url, size_bytes }
   */
  uploadFile: async (file, options = {}) => {
    if (!file) throw new Error('No file provided for upload');

    const formData = new FormData();
    formData.append('file', file);
    if (options.folder) formData.append('folder', options.folder);
    if (options.entity_ref) formData.append('entity_ref', options.entity_ref);
    if (options.entity_id) formData.append('entity_id', options.entity_id);

    const response = await api.post('/hotel/files/upload', formData);
    const fileRecord = response?.data || response;
    return {
      file_id: fileRecord?._id || fileRecord?.id,
      file_name: fileRecord?.file_name,
      file_url: fileRecord?.storage_url || fileRecord?.file_url || fileRecord?.url,
      storage_url: fileRecord?.storage_url || fileRecord?.file_url || fileRecord?.url,
      size_bytes: fileRecord?.size_bytes,
    };
  },

  getFileById: async (id) => {
    const response = await api.get(`/hotel/files/${id}`);
    return response?.data || response;
  },
};

export default fileService;
