import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";

export default {
    // SSR 활성화 (Vercel Preset 사용 시 필수)
    ssr: true,
    presets: [vercelPreset()],
} satisfies Config;
