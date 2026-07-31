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
Bạn là Trợ lý AI Phân tích & Kiểm duyệt Nội dung cho Hệ thống Cứu hộ SOS Khẩn cấp tại Việt Nam.
Nhiệm vụ: Phân tích đoạn văn bản từ người dùng và trả về ĐÚNG 1 JSON OBJECT không kèm markdown fence với cấu trúc:
{
  "confidence": 0.0 - 1.0,
  "is_flagged": true/false (true nếu là chửi tục, phân biệt chủng tộc, ngôn từ thù hận, spam, lừa đảo, nội dung nhạy cảm hoặc báo cáo giả mạo),
  "flag_reason": "Lý do cắm cờ ngắn gọn bằng tiếng Việt (hoặc null nếu an toàn)",
  "violating_phrases": ["Trích xuất ĐÚNG từ/cụm từ/câu vi phạm không phù hợp trong đoạn văn bản (mảng rỗng [] nếu an toàn)"],
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
            aiScore: typeof parsed.confidence === "number" ? parsed.confidence : 0.85,
            isFlagged: Boolean(parsed.is_flagged),
            flagReason: parsed.flag_reason || null,
            violatingPhrases: Array.isArray(parsed.violating_phrases) ? parsed.violating_phrases : [],
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

    /**
     * Phân tích cảm xúc (Sentiment Analysis) cho phản hồi/đánh giá chất lượng cứu hộ
     * @param {string} text Nội dung phản hồi cần phân tích
     * @returns {Promise<{ sentiment: string, confidence: number, source: string, keywords: string[] }>}
     */
    async classifySentiment(text) {
        if (!text || text.trim().length === 0) {
            return {
                sentiment: "NEUTRAL",
                confidence: 0.5,
                source: "EMPTY",
                keywords: []
            };
        }

        if (GROQ_API_KEY) {
            try {
                const apiKey = GROQ_API_KEY;
                const apiUrl = GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";
                const modelName = GROQ_MODEL || "llama-3.3-70b-versatile";

                const systemPrompt = `
Bạn là Trợ lý AI Phân tích Cảm xúc (Sentiment Analyzer) cho Hệ thống Cứu hộ Khẩn cấp tại Việt Nam.
Nhiệm vụ: Phân tích cảm xúc của Nạn nhân đối với chất lượng dịch vụ cứu hộ dựa trên đoạn phản hồi/nhận xét và trả về ĐÚNG 1 JSON OBJECT không kèm markdown fence:
{
  "sentiment": "POSITIVE" (hài lòng/khen ngợi/biết ơn) | "NEUTRAL" (trung lập, mô tả khách quan) | "NEGATIVE" (không hài lòng/phàn nàn/chê trách),
  "confidence": 0.0 - 1.0 (mức độ chắc chắn),
  "keywords": ["Từ/cụm từ ngắn thể hiện cảm xúc (mảng rỗng nếu không có)"]
}
Chú ý: Ngôn ngữ có thể là tiếng Việt. Chỉ chấm NEGATIVE khi có dấu hiệu rõ ràng bất mãn; nếu văn bản lịch sự, cảm ơn dù có kèm góp ý nhẹ thì vẫn là POSITIVE hoặc NEUTRAL.
                `;

                const userPrompt = `Nội dung phản hồi cần phân tích: "${text}"`;

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
                if (contentStr) {
                    const parsed = JSON.parse(contentStr);
                    const sentiment = String(parsed.sentiment || "NEUTRAL").toUpperCase();
                    const normalized = ["POSITIVE", "NEGATIVE"].includes(sentiment) ? sentiment : "NEUTRAL";
                    return {
                        sentiment: normalized,
                        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.7,
                        source: "GROQ_AI",
                        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : []
                    };
                }
            } catch (error) {
                console.warn("[AI Sentiment] Groq API error, switching to local NLP fallback:", error.message);
            }
        }

        return this.classifySentimentLocalNLP(text);
    }

    /**
     * Dự phòng Phân tích cảm xúc tiếng Việt bằng Keyword Matching & Regex
     */
    classifySentimentLocalNLP(text) {
        const lower = text.toLowerCase();

        const positiveKeywords = [
            "nhanh", "nhiệt tình", "tận tình", "tận tâm", "chu đáo", "tốt", "tuyệt", "tuyệt vời",
            "cảm ơn", "biết ơn", "hài lòng", "chuyên nghiệp", "giỏi", "xuất sắc", "đáng khen",
            "hỗ trợ tốt", "kịp thời", "hết lòng", "thân thiện", "âm cần", "nice", "good", "great",
            "awesome", "excellent", "helpful", "fast", "thank", "thanks", "perfect", "amazing"
        ];
        const negativeKeywords = [
            "chậm", "chậm chạp", "tệ", "tồi", "kém", "thô lỗ", "cọc cằn", "vô trách nhiệm",
            "không hài lòng", "bất mãn", "thất vọng", "gắt gỏng", "khó chịu", "bực", "đáng ghét",
            "lừa đảo", "lừa dối", "tởm", "dở", "hư", "sai hẹn", "đến muộn", "bad", "terrible",
            "awful", "worst", "slow", "rude", "disappointed", "unprofessional", "hate"
        ];

        const foundPositive = positiveKeywords.filter((kw) => lower.includes(kw));
        const foundNegative = negativeKeywords.filter((kw) => lower.includes(kw));

        let sentiment = "NEUTRAL";
        let confidence = 0.5;

        if (foundNegative.length > 0 && foundNegative.length >= foundPositive.length) {
            sentiment = "NEGATIVE";
            confidence = Math.min(0.9, 0.6 + foundNegative.length * 0.1);
        } else if (foundPositive.length > 0) {
            sentiment = "POSITIVE";
            confidence = Math.min(0.9, 0.6 + foundPositive.length * 0.1);
        }

        return {
            sentiment,
            confidence,
            source: "LOCAL_NLP",
            keywords: foundPositive.concat(foundNegative)
        };
    }

    /**
     * AI Tóm tắt Lịch sử & Hiệu suất Vận hành (Operational Activity Executive Summary)
     * @param {Object} params { timeframeDays, stats }
     */
    async summarizeActivityLogs({ timeframeDays = 7, stats = {} }) {
        const { totalSos = 0, completedSos = 0, cancelledSos = 0, activeRescuers = 0, topIncidentCategory = 'Y TẾ' } = stats;
        const successRate = totalSos > 0 ? ((completedSos / totalSos) * 100).toFixed(1) : "100.0";

        if (GROQ_API_KEY) {
            try {
                const apiKey = GROQ_API_KEY;
                const apiUrl = GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";
                const modelName = GROQ_MODEL || "llama-3.3-70b-versatile";

                const systemPrompt = `
Bạn là Giám đốc Điều hành Cứu hộ AI (AI Emergency Operations Director) của hệ thống Cứu hộ Khẩn cấp Việt Nam.
Hãy phân tích các số liệu vận hành và tạo ra một báo cáo tóm tắt điều hành (Executive Summary) ngắn gọn, chuyên nghiệp, súc tích bằng tiếng Việt.
Trả về ĐÚNG 1 JSON Object không có markdown fence:
{
  "summary": "Đoạn văn tóm tắt tổng quan từ 2-3 câu thể hiện tình hình đáp ứng cứu hộ.",
  "highlights": [
    "Điểm nổi bật 1 (ví dụ: Tỷ lệ tiếp nhận và xử lý ca SOS đạt...)",
    "Điểm nổi bật 2 (ví dụ: Sự cố phổ biến nhất là...)",
    "Điểm nổi bật 3 (ví dụ: Phân bổ lực lượng cứu hộ...)"
  ],
  "recommendation": "Khuyến nghị điều phối ngắn gọn cho Admin (1 câu)"
}
                `;

                const userPrompt = `Số liệu vận hành trong ${timeframeDays} ngày qua:\n- Tổng ca SOS: ${totalSos}\n- Ca hoàn thành: ${completedSos}\n- Ca bị hủy: ${cancelledSos}\n- Tỷ lệ thành công: ${successRate}%\n- Lực lượng cứu hộ hoạt động: ${activeRescuers}\n- Nhóm sự cố nổi bật: ${topIncidentCategory}`;

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
                        temperature: 0.3,
                        response_format: { type: "json_object" }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const contentStr = data.choices?.[0]?.message?.content;
                    if (contentStr) {
                        const parsed = JSON.parse(contentStr);
                        return {
                            success: true,
                            source: "GROQ_AI",
                            summaryText: parsed.summary,
                            highlights: parsed.highlights || [],
                            recommendation: parsed.recommendation
                        };
                    }
                }
            } catch (err) {
                console.warn("[AI Summary] Groq API error, fallback to local NLP summary generator:", err.message);
            }
        }

        // Local NLP Fallback Summary Generator
        return {
            success: true,
            source: "LOCAL_NLP",
            summaryText: `Trong ${timeframeDays} ngày qua, hệ thống đã tiếp nhận tổng cộng ${totalSos} yêu cầu khẩn cấp SOS. Lực lượng cứu hộ (${activeRescuers} cứu hộ viên hoạt động) đã hỗ trợ xử lý thành công ${completedSos} ca, đạt tỷ lệ hoàn thành ${successRate}%.`,
            highlights: [
                `Tỷ lệ giải cứu thành công đạt ${successRate}% với ${completedSos}/${totalSos} ca SOS.`,
                `Nhóm sự cố xuất hiện phổ biến nhất là ${topIncidentCategory}.`,
                `Đội ngũ cứu hộ duy trì ${activeRescuers} nhân sự sẵn sàng đáp ứng thời gian thực.`
            ],
            recommendation: `Khuyến nghị duy trì mật độ cứu hộ viên trực ban tại các vùng có nguy cơ cao để giữ thời gian phản hồi dưới 5 phút.`
        };
    }
}

module.exports = new AiClassifierService();
