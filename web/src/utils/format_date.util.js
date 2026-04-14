export const formatTime = (dateInput) => {
    const now = new Date();
    const date = new Date(dateInput);

    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = Math.floor(diffHours / 24);

    // < 24h → hiển thị giờ
    if (diffHours < 24) {
        return date.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    // 1 → 3 ngày
    if (diffDays <= 3) {
        return `${diffDays} ngày trước`;
    }

    // > 3 ngày → full date
    return date.toLocaleDateString("vi-VN");
};