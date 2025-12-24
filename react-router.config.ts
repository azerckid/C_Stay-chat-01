import type { Config } from "@react-router/dev/config";

export default {
    // SPA 모드로 설정 (Vercel에서 정적 파일 호스팅 용이)
    ssr: false,
} satisfies Config;
