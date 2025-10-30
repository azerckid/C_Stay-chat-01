import { type ActionFunctionArgs, data } from "react-router";
import { v2 as cloudinary } from "cloudinary";
import { requireAuth, getSession } from "~/lib/auth.server";

// Cloudinary 설정
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function action({ request }: ActionFunctionArgs) {
    const session = await getSession(request);
    await requireAuth(session, request);

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file || typeof file === "string") {
        return data({ error: "No file uploaded" }, { status: 400 });
    }

    // 파일 버퍼로 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
        // Cloudinary 업로드 (Promise 래핑)
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "staync-chat"
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        // 결과 반환 (URL)
        return { url: (uploadResult as any).secure_url };
    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        return data({ error: "Upload failed" }, { status: 500 });
    }
}
