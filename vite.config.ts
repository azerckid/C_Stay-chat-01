import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  build: {
    sourcemap: false, // 프로덕션 빌드에서 sourcemap 비활성화 (에러 방지)
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // 작은 청크 파일들을 합치기 위한 최적화
        manualChunks: (id) => {
          // node_modules는 별도 청크로 분리
          if (id.includes("node_modules")) {
            // 큰 라이브러리들은 개별 청크로
            if (id.includes("@langchain") || id.includes("langgraph")) {
              return "vendor-ai";
            }
            if (id.includes("pusher")) {
              return "vendor-pusher";
            }
            if (id.includes("@prisma") || id.includes("better-auth")) {
              return "vendor-auth";
            }
            return "vendor";
          }
        },
      // 빈 청크 파일 생성 경고 억제
      inlineDynamicImports: false,
      },
      // 빈 청크에 대한 경고 무시
      onwarn(warning, warn) {
        // "Generated an empty chunk" 메시지 무시 (API 라우트는 서버 전용이므로 정상)
        if (
          warning.code === "EMPTY_BUNDLE" ||
          warning.message?.includes("empty chunk") ||
          warning.message?.includes("Generated an empty chunk")
        ) {
          return;
        }
        warn(warning);
      },
    },
    // 작은 청크 파일 경고 방지
    chunkSizeWarningLimit: 1000,
  },
  // Sourcemap 관련 추가 설정
  esbuild: {
    sourcemap: false,
  },
});
