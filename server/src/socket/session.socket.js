const redis = require("@/config/redis.config");
const sosRequestService = require("@modules/sos/service/sos_request.service");

const SESSION_TTL_SECONDS = 24 * 60 * 60;

// Thời gian chặn reconnect của thiết bị vừa bị kick (giây) — chống vòng lặp kick qua lại:
// thiết bị cũ còn giữ creds/token cũ (socket auto-reconnect, background isolate) reconnect
// bằng deviceId cũ rồi kick ngược thiết bị mới.
const KICKED_TTL_SECONDS = 60;

// Đánh dấu thiết bị vừa bị kick để chặn mọi socket cùng deviceId reconnect trong cooldown.
const setKickedDevice = async (userId, deviceId) => {
    if (!deviceId) return;
    try {
        await redis.set(`kicked_device:${userId}:${deviceId}`, "1", "EX", KICKED_TTL_SECONDS);
    } catch (error) {
        console.warn(`[SESSION] Lỗi ghi kicked_device: ${error.message}`);
    }
};

const isDeviceKicked = async (userId, deviceId) => {
    if (!deviceId) return false;
    try {
        const raw = await redis.get(`kicked_device:${userId}:${deviceId}`);
        return Boolean(raw);
    } catch (error) {
        console.warn(`[SESSION] Lỗi đọc kicked_device: ${error.message}`);
        return false;
    }
};

const getActiveSession = async (userId) => {
    try {
        const raw = await redis.get(`active_session:${userId}`);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        console.warn(`[SESSION] Lỗi đọc active_session: ${error.message}`);
        return null;
    }
};

const setActiveSession = async (userId, deviceId, socketId) => {
    try {
        await redis.set(
            `active_session:${userId}`,
            JSON.stringify({ deviceId, socketId }),
            "EX",
            SESSION_TTL_SECONDS
        );
    } catch (error) {
        console.warn(`[SESSION] Lỗi ghi active_session: ${error.message}`);
    }
};

// Xóa active_session chỉ khi vẫn còn thuộc đúng deviceId + socketId hiện tại (atomic qua Lua,
// tránh xóa nhầm phiên của thiết bị mới khi socket cũ đang trong lúc bị kick/reconnect)
const clearActiveSession = async (userId, deviceId, socketId) => {
    try {
        await redis.eval(
            "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end",
            1,
            `active_session:${userId}`,
            JSON.stringify({ deviceId, socketId })
        );
    } catch (error) {
        console.warn(`[SESSION] Lỗi xóa active_session: ${error.message}`);
    }
};

const deviceSocketsKey = (userId, deviceId) => `device_sockets:${userId}:${deviceId || 'null'}`;

const addDeviceSocket = async (userId, deviceId, socketId) => {
    if (!deviceId) return;
    try {
        const key = deviceSocketsKey(userId, deviceId);
        await redis.sadd(key, socketId);
        await redis.expire(key, SESSION_TTL_SECONDS);
    } catch (error) {
        console.warn(`[SESSION] Lỗi thêm socket vào device_sockets: ${error.message}`);
    }
};

const removeDeviceSocket = async (userId, deviceId, socketId) => {
    if (!deviceId) return;
    try {
        await redis.srem(deviceSocketsKey(userId, deviceId), socketId);
    } catch (error) {
        console.warn(`[SESSION] Lỗi xóa socket khỏi device_sockets: ${error.message}`);
    }
};

const getDeviceSocketIds = async (userId, deviceId) => {
    if (!deviceId) return [];
    try {
        return await redis.smembers(deviceSocketsKey(userId, deviceId));
    } catch (error) {
        console.warn(`[SESSION] Lỗi đọc device_sockets: ${error.message}`);
        return [];
    }
};

const deleteDeviceSockets = async (userId, deviceId) => {
    if (!deviceId) return;
    try {
        await redis.del(deviceSocketsKey(userId, deviceId));
    } catch (error) {
        console.warn(`[SESSION] Lỗi xóa device_sockets: ${error.message}`);
    }
};

const kickSocket = (socket, message) => {
    if (!socket) return;
    try {
        socket.emit("user:kicked", { message });
        socket.disconnect(true);
    } catch (error) {
        console.warn(`[SESSION] Lỗi kick socket cũ: ${error.message}`);
    }
};

const isInActiveRescue = async ({ userId, role }) => {
    try {
        if (role !== "RESCUER" && role !== "VICTIM") return false;
        const activeSos = await sosRequestService.getActiveSOS({ userId, role });
        return Boolean(activeSos);
    } catch (error) {
        console.warn(`[SESSION] Lỗi kiểm tra ca cứu hộ đang hoạt động: ${error.message}`);
        return false;
    }
};

// Xử lý "single active session" khi có thiết bị kết nối mới cùng tài khoản:
// - ADMIN: luôn kick toàn bộ socket của thiết bị cũ.
// - RESCUER/VICTIM: nếu đang trong ca cứu hộ ở thiết bị cũ -> chặn thiết bị mới (trả về 'blocked');
//   nếu rảnh -> kick toàn bộ socket của thiết bị cũ.
// - Reconnect cùng deviceId (mất mạng, nhiều socket của cùng 1 thiết bị: foreground + background)
//   -> chỉ cập nhật socketId, không kick.
const handleSessionTakeover = async (io, socket) => {
    const { userId, role, deviceId } = socket.user || {};

    if (!userId) return "ok";

    const active = await getActiveSession(userId);

    // Thiết bị vừa bị kick không được phép reconnect trong thời gian cooldown.
    // Đặt TRƯỚC mọi xử lý takeover để socket cũ (còn giữ token/deviceId cũ) không thể
    // tự reconnect rồi kick ngược thiết bị mới. Đăng nhập lại thật (sau khi logout
    // xóa sạch storage) sẽ tạo deviceId mới nên không bị vướng cooldown này.
    if (await isDeviceKicked(userId, deviceId)) {
        socket.emit("session:blocked", {
            message: "Tài khoản của bạn đã được đăng nhập trên thiết bị khác. Vui lòng đăng nhập lại.",
        });
        socket.disconnect(true);
        console.log(`[SESSION] Chặn reconnect của thiết bị vừa bị kick ${deviceId} cho ${role} ${userId}.`);
        return "blocked";
    }

    // Reconnect cùng thiết bị (deviceId trùng) -> chỉ cập nhật, không kick
    if (active && active.deviceId && deviceId && active.deviceId === deviceId) {
        await setActiveSession(userId, deviceId, socket.id);
        await addDeviceSocket(userId, deviceId, socket.id);
        return "ok";
    }

    // Thiết bị khác đăng nhập
    if (active && active.deviceId && deviceId && active.deviceId !== deviceId) {
        // RESCUER/VICTIM đang trong ca cứu hộ trên thiết bị cũ -> chặn thiết bị mới
        if (role === "RESCUER" || role === "VICTIM") {
            const inRescue = await isInActiveRescue({ userId, role });
            if (inRescue) {
                socket.emit("session:blocked", {
                    message: "Tài khoản của bạn đang tham gia ca cứu hộ trên thiết bị khác. Vui lòng đăng nhập lại sau khi ca cứu hộ kết thúc.",
                });
                socket.disconnect(true);
                console.log(`[SESSION] Chặn thiết bị mới của ${role} ${userId} vì đang trong ca cứu hộ.`);
                return "blocked";
            }
        }

        // Kick toàn bộ socket của thiết bị cũ (foreground + background) để tránh ping-pong
        const oldDeviceId = active.deviceId;
        const oldSocketIds = await getDeviceSocketIds(userId, oldDeviceId);
        await setKickedDevice(userId, oldDeviceId);
        for (const oldSocketId of oldSocketIds) {
            const oldSocket = io.sockets.sockets.get(oldSocketId);
            kickSocket(oldSocket, "Tài khoản của bạn đã được đăng nhập trên thiết bị khác.");
        }
        // Fallback: nếu thiết bị cũ không có danh sách socket (VD: client chưa gửi deviceId)
        if (oldSocketIds.length === 0) {
            kickSocket(io.sockets.sockets.get(active.socketId), "Tài khoản của bạn đã được đăng nhập trên thiết bị khác.");
        }
        await deleteDeviceSockets(userId, oldDeviceId);

        await setActiveSession(userId, deviceId, socket.id);
        await addDeviceSocket(userId, deviceId, socket.id);
        console.log(`[SESSION] Kick toàn bộ socket của thiết bị cũ ${oldDeviceId} cho ${role} ${userId} vì có thiết bị mới đăng nhập.`);
        return "ok";
    }

    // Chưa có phiên hoặc không xác định được deviceId -> chiếm quyền phiên
    await setActiveSession(userId, deviceId, socket.id);
    await addDeviceSocket(userId, deviceId, socket.id);
    return "ok";
};

// Đăng ký dọn dẹp active_session khi socket ngắt kết nối
module.exports = (socket, io) => {
    socket.on("disconnect", async () => {
        const { userId, deviceId } = socket.user || {};
        if (userId) {
            await clearActiveSession(userId, deviceId, socket.id);
            await removeDeviceSocket(userId, deviceId, socket.id);
        }
    });
};

module.exports.handleSessionTakeover = handleSessionTakeover;
