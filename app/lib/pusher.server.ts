import Pusher from "pusher";
import dotenv from "dotenv";

// .env 파일 강제 로드
dotenv.config();

const pusherKey = process.env.PUSHER_KEY || process.env.VITE_PUSHER_KEY || "";

console.log("--------- [Server Pusher Init] ---------");
console.log("PUSHER_APP_ID:", process.env.PUSHER_APP_ID ? "OK" : "MISSING");
console.log("PUSHER_KEY:", pusherKey ? `OK (${pusherKey.substring(0, 5)}...)` : "MISSING (Check .env)");
console.log("PUSHER_SECRET:", process.env.PUSHER_SECRET ? "OK" : "MISSING");
console.log("PUSHER_CLUSTER:", process.env.PUSHER_CLUSTER);
console.log("----------------------------------------");

// 싱글톤 패턴으로 Pusher 인스턴스 생성
export const pusherServer = new Pusher({
    appId: process.env.PUSHER_APP_ID || "",
    key: pusherKey,
    secret: process.env.PUSHER_SECRET || "",
    cluster: process.env.PUSHER_CLUSTER || "ap3",
    useTLS: true,
});
