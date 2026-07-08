// services/redis.subscriber.js
const redis = require("../config/redis.config");
const { handleSosOffer } = require("./sos.emitter"); // <-- Import file emit ở đây

const subscriber = redis.duplicate();

module.exports = async (io) => {

    subscriber.on("error", (err) => {
        console.error("REDIS SUB ERROR", err);
    });

    // Lắng nghe tất cả message từ Redis
    subscriber.on("message", (channel, message) => {

        try {
            const data = JSON.parse(message);

            // Phân luồng (Route) theo tên channel
            switch (channel) {
                case "sos:offer":
                    // Truyền data và io qua file emit để xử lý
                    handleSosOffer(io, data); 
                    break;

                default:
                    console.warn(`[REDIS SUB] Unhandled channel: ${channel}`);
            }
        } catch (err) {
            console.error("[REDIS SUB] JSON Parse Error:", err);
        }
    });

    // Subscribe các channels
    await subscriber.subscribe("sos:offer");
};