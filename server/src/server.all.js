require("module-alias/register");

// Chạy BullMQ Worker chung tiến trình với API server.
// Mục đích: deploy trên Render chỉ cần 1 web service gói free
// (Render không hỗ trợ background worker ở gói free).
const worker = require("./workers/sos.worker");

worker.on("error", (err) => {
    console.error("[WORKER] Lỗi worker/Redis:", err.message);
});

require("./server");
