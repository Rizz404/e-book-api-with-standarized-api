import cloudinary from "../config/cloudinary_config";

// * Fungsi helper untuk cek apakah string adalah URL valid
export const isValidUrl = (string: string) => {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
};

// * Fungsi helper untuk cek apakah URL dari Cloudinary
export const isCloudinaryUrl = (url: string) => {
  return url.includes("cloudinary.com");
};

export const deleteCloudinaryImage = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
  }
};

export const getPublicIdFromUrl = (url: string) => {
  const splitUrl = url.split("/");
  const filename = splitUrl[splitUrl.length - 1].split(".")[0];
  const folder = splitUrl[splitUrl.length - 2];
  return `${folder}/${filename}`;
};
