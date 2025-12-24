import { type ActionFunctionArgs, data } from "react-router";
import { requireAuth, getSession } from "~/lib/auth.server";
import { uploadToCloudinary } from "~/lib/cloudinary.server";

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
        // 서버 유틸리티를 통한 업로드
        const url = await uploadToCloudinary(buffer);

        // 결과 반환 (URL)
        return { url };
    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        return data({ error: "Upload failed" }, { status: 500 });
    }
}
