import React, { useState, useEffect, useRef } from "react";
import {
  PiHeadsetBold,
  PiXBold,
  PiArrowLeftBold,
  PiPaperPlaneRightFill,
  PiMagnifyingGlassBold,
  PiUserBold,
  PiShieldWarningBold,
  PiChatCircleDotsBold,
  PiDotsThreeVerticalBold,
  PiWarningFill,
} from "react-icons/pi";
import { getConversationsAdmin, getMessagesAdmin } from "@/api/admin/ChatApi";
import { subscribeChatEvents, subscribeChatErrors, sendChatMessage } from "@/socket";
import { formatTime } from "@/utils/format_date.util";

const AdminEmergencyChatComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasUnreadDot, setHasUnreadDot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorModalReason, setErrorModalReason] = useState(null);

  const messagesEndRef = useRef(null);

  // 1. Tải danh sách hội thoại
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await getConversationsAdmin();
      if (res?.status === "success" && Array.isArray(res.data)) {
        setConversations(res.data);
        const totalUnread = res.data.reduce((sum, item) => sum + (parseInt(item.unread_count) || 0), 0);
        setUnreadCount(totalUnread);
        if (totalUnread > 0) {
          setHasUnreadDot(true);
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách hội thoại Admin:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Tải tin nhắn của cuộc hội thoại được chọn
  const fetchMessages = async (conversationId) => {
    try {
      const res = await getMessagesAdmin(conversationId);
      if (res?.status === "success" && Array.isArray(res.data)) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error("Lỗi khi tải tin nhắn Admin:", err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // 3. Lắng nghe tin nhắn Socket mới trong thời gian thực
  useEffect(() => {
    const unsubscribe = subscribeChatEvents((payload) => {
      const { message, conversation } = payload || {};
      if (!message) return;

      // Cập nhật danh sách hội thoại khi có tin mới
      setConversations((prevConvs) => {
        const convId = message.conversation_id || conversation?.conversation_id;
        const existsIndex = prevConvs.findIndex((c) => c.conversation_id === convId);

        let updatedList = [...prevConvs];
        if (existsIndex !== -1) {
          const old = updatedList[existsIndex];
          const updatedConv = {
            ...old,
            last_message: message.content || old.last_message,
            last_message_at: message.created_at || new Date().toISOString(),
          };
          updatedList.splice(existsIndex, 1);
          updatedList.unshift(updatedConv);
        } else if (conversation) {
          updatedList.unshift(conversation);
        }
        return updatedList;
      });

      // Nếu đang mở đúng hội thoại đó -> Thêm tin nhắn trực tiếp
      if (selectedConversation && (message.conversation_id === selectedConversation.conversation_id || conversation?.conversation_id === selectedConversation.conversation_id)) {
        setMessages((prev) => {
          if (prev.some((m) => m.message_id === message.message_id || m.id === message.message_id)) {
            return prev;
          }
          return [...prev, message];
        });
      } else {
        // Nếu không mở hoặc đang đóng widget -> Kích hoạt chấm đỏ thông báo
        setHasUnreadDot(true);
        setUnreadCount((prev) => prev + 1);
      }
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [selectedConversation]);

  // Lắng nghe lỗi gửi tin nhắn qua Socket (ví dụ từ AI Moderation)
  useEffect(() => {
    const unsubError = subscribeChatErrors((payload) => {
      const { message: errorMsg, content, tempId } = payload || {};
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.message_id === tempId || (msg.is_me && msg.content === content && !msg.is_failed)) {
            return {
              ...msg,
              is_failed: true,
              error_message: errorMsg || "Nội dung tin nhắn không hợp lệ hoặc bị hệ thống từ chối.",
            };
          }
          return msg;
        })
      );
    });

    return () => {
      if (typeof unsubError === "function") unsubError();
    };
  }, []);

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (selectedConversation && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedConversation]);

  const handleToggleWidget = () => {
    setIsOpen((prev) => {
      const nextState = !prev;
      if (nextState) {
        setHasUnreadDot(false);
        fetchConversations();
      }
      return nextState;
    });
  };

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    fetchMessages(conv.conversation_id);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    setMessages([]);
    fetchConversations();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConversation) return;

    const content = inputText.trim();
    setInputText("");

    const conversationId = selectedConversation.conversation_id;
    const partnerId = selectedConversation.partner_id;
    const tempId = "temp_" + Date.now();

    const tempMsg = {
      message_id: tempId,
      conversation_id: conversationId,
      content,
      sender_id: "me",
      is_me: true,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);

    sendChatMessage({
      conversationId,
      partnerId,
      content,
      tempId,
    });
  };

  const filteredConversations = conversations.filter((c) => {
    const name = (c.partner_name || c.user1_name || "").toLowerCase();
    const lastMsg = (c.last_message || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || lastMsg.includes(query);
  });

  return (
    <>
      {/* 1. NÚT BONG BÓNG CHAT NỔI (FLOATING CHAT BUBBLE) */}
      <button
        onClick={handleToggleWidget}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center p-4 rounded-full bg-slate-900 text-white shadow-2xl hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all duration-200 border border-slate-700 cursor-pointer group"
        title="Tổng đài Hỗ trợ Khẩn cấp"
      >
        <PiHeadsetBold className="text-2xl text-red-500 group-hover:text-red-400 transition-colors" />
        
        {/* CHẤM ĐỎ THÔNG BÁO TỨC THÌ (RED DOT NOTIFICATION) */}
        {hasUnreadDot && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white font-bold text-[11px] border-2 border-white shadow-lg animate-pulse">
            {unreadCount > 0 ? (unreadCount > 99 ? "99+" : unreadCount) : ""}
          </span>
        )}
      </button>

      {/* 2. HỘP THOẠI CHAT POPUP (FLOATING CHAT BOX) */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[540px] max-h-[85vh] bg-white dark:bg-gray-100 rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-bottom-5">
          {/* HEADER CHAT BOX */}
          <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              {selectedConversation ? (
                <button
                  onClick={handleBackToList}
                  className="p-1.5 rounded-full hover:bg-slate-800 text-gray-300 hover:text-white dark:text-gray-600 dark:hover:text-white transition-colors cursor-pointer"
                  title="Quay lại danh sách"
                >
                  <PiArrowLeftBold className="text-lg" />
                </button>
              ) : (
                <div className="w-9 h-9 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                  <PiHeadsetBold className="text-xl text-red-500" />
                </div>
              )}

              <div>
                <h3 className="font-bold text-sm text-white leading-tight">
                  {selectedConversation
                    ? selectedConversation.partner_name || "Người dùng Hỗ trợ"
                    : "Tổng đài Hỗ trợ Khẩn cấp"}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] text-gray-400 dark:text-gray-700 font-medium">
                    {selectedConversation ? "Đang hỗ trợ" : "Trực tuyến 24/7"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleToggleWidget}
              className="p-1.5 rounded-full hover:bg-slate-800 text-gray-400 hover:text-white dark:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
              title="Đóng"
            >
              <PiXBold className="text-lg" />
            </button>
          </div>

          {/* BODY: DANH SÁCH HOẶC CHI TIẾT CHAT */}
          {!selectedConversation ? (
            /* STATE A: DANH SÁCH CUỘC HỘI THOẠI */
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/50">
              {/* Thanh tìm kiếm */}
              <div className="p-3 border-b border-gray-100 bg-white dark:bg-gray-100">
                <div className="relative flex items-center">
                  <PiMagnifyingGlassBold className="absolute left-3 text-gray-400 dark:text-gray-500 text-sm" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm người dùng..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-slate-900 outline-none text-gray-800 placeholder-gray-400 transition-all"
                  />
                </div>
              </div>

              {/* Danh sách hội thoại */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-600 text-xs">
                    <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mb-2"></div>
                    Đang tải danh sách hội thoại...
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-600 text-xs text-center px-4">
                    <PiChatCircleDotsBold className="text-3xl mb-2 text-gray-300 dark:text-gray-500" />
                    Chưa có tin nhắn hỗ trợ khẩn cấp nào
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const isUnread = parseInt(conv.unread_count) > 0;
                    const isClosed = conv.is_closed === true;
                    return (
                      <div
                        key={conv.conversation_id}
                        onClick={() => handleSelectConversation(conv)}
                        className={`group p-3 rounded-2xl cursor-pointer transition-all border flex items-start gap-3 ${
                          isUnread
                            ? "bg-red-50/60 border-red-200/80 shadow-sm"
                            : "bg-white dark:bg-gray-100 border-gray-100 hover:border-gray-200 hover:shadow-sm"
                        }`}
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                            {(conv.partner_name || "U")[0].toUpperCase()}
                          </div>
                          {isUnread && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <h4 className="text-xs font-bold text-gray-900 truncate">
                                {conv.partner_name || "Người dùng Cứu hộ"}
                              </h4>
                              {isClosed && (
                                <span className="text-[9px] font-semibold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-md shrink-0">
                                  Đã đóng
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400 dark:text-gray-600">
                              {conv.last_message_at ? formatTime(conv.last_message_at) : ""}
                            </span>
                          </div>
                          <p
                            className={`text-xs truncate mt-0.5 ${
                              isUnread ? "font-semibold text-red-600" : "text-gray-500"
                            }`}
                          >
                            {conv.last_message || "Đã mở cuộc hội thoại..."}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* STATE B: CHI TIẾT TIN NHẮN VỚI NGƯỜI DÙNG */
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/50">
              {/* Banner kênh chat đã bị đóng */}
              {selectedConversation?.is_closed && (
                <div className="bg-amber-50 border-b border-amber-200/80 p-2.5 px-4 flex items-center gap-2 text-xs text-amber-800 font-medium">
                  <PiShieldWarningBold className="text-base text-amber-600 shrink-0" />
                  <span>Kênh chat này đã tự động khóa do ca cứu hộ đã hoàn thành hoặc bị hủy.</span>
                </div>
              )}

              {/* Danh sách tin nhắn */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600 text-xs">
                    Bắt đầu trao đổi hỗ trợ với người dùng
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.is_me || msg.sender_id === "me" || (selectedConversation && msg.sender_id !== selectedConversation.partner_id);
                    const isFailed = msg.is_failed;

                    return (
                      <div
                        key={msg.message_id || idx}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-1.5 max-w-[85%]">
                          {isMe && isFailed && (
                            <button
                              type="button"
                              onClick={() => setErrorModalReason(msg.error_message || "Nội dung tin nhắn bị từ chối do vi phạm tiêu chuẩn cộng đồng.")}
                              className="p-1 rounded-full bg-red-100 hover:bg-red-200 transition-colors text-red-600 flex-shrink-0 cursor-pointer"
                              title="Nhấn để xem lý do từ chối"
                            >
                              <PiWarningFill className="text-base" />
                            </button>
                          )}
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-xs shadow-sm leading-relaxed ${
                              isFailed
                                ? "bg-red-50 text-red-900 dark:text-red-200 border border-red-200 line-through"
                                : isMe
                                ? "bg-slate-900 text-white rounded-tr-none"
                                : "bg-white dark:bg-gray-100 text-gray-800 border border-gray-100 rounded-tl-none"
                            }`}
                          >
                            {msg.content}
                          </div>
                          {!isMe && isFailed && (
                            <button
                              type="button"
                              onClick={() => setErrorModalReason(msg.error_message || "Nội dung tin nhắn bị từ chối do vi phạm tiêu chuẩn cộng đồng.")}
                              className="p-1 rounded-full bg-red-100 hover:bg-red-200 transition-colors text-red-600 flex-shrink-0 cursor-pointer"
                              title="Nhấn để xem lý do từ chối"
                            >
                              <PiWarningFill className="text-base" />
                            </button>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-gray-600 mt-1 px-1 flex items-center gap-1">
                          {isFailed && <span className="text-red-500 font-semibold">Gửi thất bại</span>}
                          {msg.created_at ? formatTime(msg.created_at) : ""}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Ô NHẬP TIN NHẮN GỬI CHO NGƯỜI DÙNG */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-gray-100 border-t border-gray-100 flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  disabled={selectedConversation?.is_closed}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={selectedConversation?.is_closed ? "Kênh chat đã đóng..." : "Nhập câu trả lời hỗ trợ..."}
                  className="flex-1 px-4 py-2.5 text-xs bg-gray-100 rounded-2xl border-0 focus:ring-2 focus:ring-slate-900 outline-none text-gray-800 placeholder-gray-400 transition-all disabled:bg-gray-200 disabled:text-gray-500"
                />
                <button
                  type="submit"
                  disabled={selectedConversation?.is_closed || !inputText.trim()}
                  className="p-2.5 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-center"
                >
                  <PiPaperPlaneRightFill className="text-sm" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* POPUP HIỂN THỊ LÝ DO TIN NHẮN TỪ CHỐI / THẤT BẠI */}
      {errorModalReason && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-100 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-red-100 flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <PiWarningFill className="text-2xl" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Tin nhắn bị từ chối</h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-6 bg-gray-50 p-3 rounded-2xl border border-gray-100 w-full">
              {errorModalReason}
            </p>
            <button
              type="button"
              onClick={() => setErrorModalReason(null)}
              className="w-full py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminEmergencyChatComponent;
