const penaltyModel = {
    streakKey: (userId) => `cancel_streak:${userId}`,
    rescuerLockKey: (userId) => `rescuer:suspended:${userId}`,
    victimLockKey: (userId) => `victim:cancel_blocked:${userId}`,
    // Cửa sổ trượt 24h: 2 lần hủy liên tiếp trong 24h sẽ kích hoạt hình phạt
    streakTtlSeconds: 24 * 60 * 60,
    // Thang phạt: 2 → khóa 2h, 4 → 12h, 6 → 24h, 8 → cấm vĩnh viễn
    ladder: [
        { streak: 2, hours: 2 },
        { streak: 4, hours: 12 },
        { streak: 6, hours: 24 },
        { streak: 8, hours: null }
    ]
};

module.exports = penaltyModel;
