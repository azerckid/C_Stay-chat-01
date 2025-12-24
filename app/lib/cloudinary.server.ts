import { v2 as cloudinary } from "cloudinary";

// Cloudinary 설정 - 서버 사이드에서만 실행됨
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadToCloudinary(buffer: Buffer, folder: string = "staync-chat"): Promise<string> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result?.secure_url || "");
            }
        );
        uploadStream.end(buffer);
    });
}
