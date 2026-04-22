import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export type UploadFolder =
  | "properties"
  | "documents"
  | "avatars"
  | "clients";

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: UploadFolder,
  options?: {
    filename?: string;
    resourceType?: "image" | "raw" | "auto";
    transformation?: object[];
  }
) {
  return new Promise<{
    url: string;
    publicId: string;
    format: string;
    bytes: number;
    width?: number;
    height?: number;
  }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `real-estate-crm/${folder}`,
        resource_type: options?.resourceType || "auto",
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        transformation: options?.transformation,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Upload failed"));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
}

export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "raw" | "auto" = "auto"
) {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
}

export async function getSignedUploadUrl(
  folder: UploadFolder,
  publicId?: string
) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const params = {
    timestamp,
    folder: `real-estate-crm/${folder}`,
    ...(publicId && { public_id: publicId }),
  };
  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!
  );
  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder: `real-estate-crm/${folder}`,
  };
}
