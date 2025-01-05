import cloudinary from "../config/cloudinary_config";

export const isValidUrl = (string: string) => {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
};

export const isCloudinaryUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname.includes("cloudinary.com");
  } catch {
    return false;
  }
};

export const getPublicIdFromUrl = (url: string) => {
  try {
    // Format URL Cloudinary:
    // https://res.cloudinary.com/<cloud_name>/image/upload/v1234567890/folder/filename.ext
    const parsedUrl = new URL(url);
    const pathParts = parsedUrl.pathname.split("/");

    // Mencari index dari 'upload' dalam path
    const uploadIndex = pathParts.findIndex((part) => part === "upload");
    if (uploadIndex === -1) throw new Error("Invalid Cloudinary URL");

    // Mengambil semua bagian setelah vXXXXXXX
    const relevantParts = pathParts.slice(uploadIndex + 2);

    // Menggabungkan path dan menghapus ekstensi file
    const publicId = relevantParts.join("/").replace(/\.[^/.]+$/, "");

    // Decode URI component untuk menangani karakter khusus
    return decodeURIComponent(publicId);
  } catch (error) {
    console.error("Error extracting public ID:", error);
    throw error;
  }
};

export const deleteCloudinaryImage = async (url: string) => {
  try {
    if (!isCloudinaryUrl(url)) {
      console.warn("Not a Cloudinary URL:", url);
      return;
    }

    const publicId = getPublicIdFromUrl(url);
    console.log("Attempting to delete with public ID:", publicId);

    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Cloudinary deletion result:", result);

    if (result.result !== "ok") {
      throw new Error(`Failed to delete image: ${result.result}`);
    }

    return result;
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw error;
  }
};
