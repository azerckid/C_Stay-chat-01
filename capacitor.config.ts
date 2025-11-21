import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.staync.chat',
  appName: 'STAYnC Chat',
  webDir: 'build/client',
  server: {
    url: 'http://localhost:5173', // 개발 서버 URL (나중에 배포 URL로 변경 필요)
    cleartext: true
  },
  plugins: {
    Keyboard: {
      resize: "body",
      style: "DARK",
      resizeOnFullScreen: true
    },
    StatusBar: {
      style: "DARK",
      overlaysWebView: false,
    }
  }
};

export default config;
