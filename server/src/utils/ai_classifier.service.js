const { GROQ_API_KEY, GROQ_API_URL, GROQ_MODEL } = require("@/config/env.config");

/**
 * AI Classifier Service
 * Hỗ trợ 2 cơ chế:
 * 1. Groq Cloud API (GROQ_API_KEY) - Tốc độ siêu nhanh, Quota lớn (Llama-3.3-70b / Llama-3.1-8b).
 * 2. NLP Rule-based Fallback (Dự phòng nội bộ bằng Từ khóa tiếng Việt chuyên sâu).
 */

class AiClassifierService {
    /**
     * Phân loại nội dung văn bản & phát hiện cờ spam/bất thường
     * @param {string} text Nội dung cần phân tích
     * @param {string} entityType Loai thực thể ('SOS_REQUEST', 'AMENITY_FEEDBACK', 'DANGEROUS_POINT', 'MESSAGE')
     * @returns {Promise<{ suggestedCategory: string, aiScore: number, isFlagged: boolean, flagReason: string|null, actionTaken: string }>}
     */
    async classify(text, entityType = "SOS_REQUEST") {
        if (!text || text.trim().length === 0) {
            return {
                suggestedCategory: "KHÁC",
                aiScore: 0.1,
                isFlagged: false,
                flagReason: null,
                actionTaken: "NONE"
            };
        }

        // Thử gọi Groq Cloud API nếu có GROQ_API_KEY
        if (GROQ_API_KEY) {
            try {
                const groqResult = await this.classifyWithGroq(text, entityType);
                if (groqResult) return groqResult;
            } catch (error) {
                console.warn("[AI Classifier] Groq API error, switching to local NLP fallback:", error.message);
            }
        }

        // Fallback: Sử dụng Bộ phân loại quy tắc NLP tiếng Việt nội bộ
        return this.classifyLocalNLP(text, entityType);
    }

    /**
     * Tích hợp Groq API qua Chat Completions (Format JSON)
     */
    async classifyWithGroq(text, entityType) {
        const apiKey = GROQ_API_KEY;
        const apiUrl = GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";
        const modelName = GROQ_MODEL || "llama-3.3-70b-versatile";

        const systemPrompt = `
Bạn là Trợ lý AI Phân loại & Kiểm duyệt Nội dung cho Hệ thống Cứu hộ SOS Khẩn cấp tại Việt Nam.
Nhiệm vụ: Phân tích đoạn văn bản từ người dùng và trả về ĐÚNG 1 JSON OBJECT không kèm markdown fence với cấu trúc:
{
  "category": "Y TẾ | TAI NẠN GIAO THÔNG | HỎNG XE | NGẬP LỤT/CỨU HỘ | THÔNG TIN SAI | SPAM/LỪA ĐẢO | KHÁC",
  "confidence": 0.0 - 1.0,
  "is_flagged": true/false (true nếu là spam, lừa đảo, chửi thề, nội dung quảng cáo hoặc báo cáo giả mạo),
  "flag_reason": "Lý do cắm cờ ngắn gọn bằng tiếng Việt (hoặc null nếu an toàn)",
  "urgency": "HIGH | MEDIUM | LOW"
}
        `;

        const userPrompt = `Thực thể: ${entityType}\nNội dung cần phân tích: "${text}"`;

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: modelName,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.1,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Groq API returned HTTP ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const contentStr = data.choices?.[0]?.message?.content;
        if (!contentStr) return null;

        const parsed = JSON.parse(contentStr);
        return {
            suggestedCategory: parsed.category || "KHÁC",
            aiScore: typeof parsed.confidence === "number" ? parsed.confidence : 0.85,
            isFlagged: Boolean(parsed.is_flagged),
            flagReason: parsed.flag_reason || null,
            actionTaken: parsed.is_flagged ? "REQUIRES_ADMIN_REVIEW" : "NONE"
        };
    }

    /**
     * Dự phòng Phân loại NLP tiếng Việt sử dụng Keyword Matching & Regex
     */
    classifyLocalNLP(text, entityType) {
        const lower = text.toLowerCase();

        // 1. Kiểm tra Spam / Quảng cáo / Lừa đảo
        const spamRegex = /(bán acc|tài khoản|khuyến mãi|chiết khấu|nạp thẻ|cờ bạc|game bai|link nhấp|cho vay|lãi suất|tuyển cộng tác viên|zalo 0|lh 0)/i;
        if (spamRegex.test(lower)) {
            return {
                suggestedCategory: "SPAM/LỪA ĐẢO",
                aiScore: 0.92,
                isFlagged: true,
                flagReason: "Phát hiện từ khóa quảng cáo / cờ bạc / lừa đảo",
                actionTaken: "REQUIRES_ADMIN_REVIEW"
            };
        }

        // 2. Y Tế / Cấp Cứu
        const medicalKeywords = ["máu", "bệnh", "đau", "ngất", "bất tỉnh", "thở", "tim", "gãy xương", "cấp cứu", "thương", "bệnh viện", "bác sĩ", "sinh tử"];
        if (medicalKeywords.some(kw => lower.includes(kw))) {
            return {
                suggestedCategory: "Y TẾ",
                aiScore: 0.88,
                isFlagged: false,
                flagReason: null,
                actionTaken: "NONE"
            };
        }

        // 3. Tai nạn giao thông
        const accidentKeywords = ["tai nạn", "tông", "va chạm", "ngã xe", "lật xe", "nổ lốp", "xe máy", "ô tô", "chấn thương"];
        if (accidentKeywords.some(kw => lower.includes(kw))) {
            return {
                suggestedCategory: "TAI NẠN GIAO THÔNG",
                aiScore: 0.85,
                isFlagged: false,
                flagReason: null,
                actionTaken: "NONE"
            };
        }

        // 4. Hỏng xe / Sự cố phương tiện
        const vehicleKeywords = ["hết xăng", "thủng lốp", "xịt lốp", "đứt xích", "không nổ máy", "hỏng bugi", "chết máy", "kích bình", "hết ắc quy", "sửa xe"];
        if (vehicleKeywords.some(kw => lower.includes(kw))) {
            return {
                suggestedCategory: "HỎNG XE",
                aiScore: 0.82,
                isFlagged: false,
                flagReason: null,
                actionTaken: "NONE"
            };
        }

        // 5. Ngập lụt / Thiên tai
        const floodKeywords = ["ngập", "lũ", "nước dâng", "mắc kẹt", "mưa lớn", "sạt lở", "cuốn trôi", "chìm"];
        if (floodKeywords.some(kw => lower.includes(kw))) {
            return {
                suggestedCategory: "NGẬP LỤT/CỨU HỘ",
                aiScore: 0.86,
                isFlagged: false,
                flagReason: null,
                actionTaken: "NONE"
            };
        }

        // Mặc định
        return {
            suggestedCategory: "KHÁC",
            aiScore: 0.50,
            isFlagged: false,
            flagReason: null,
            actionTaken: "NONE"
        };
    }
}

module.exports = new AiClassifierService();
