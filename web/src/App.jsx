import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { routes } from "./routes";
import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import AdminLayout from "@/layouts/AdminLayout/AdminLayout";
import * as AuthApi from "@/api/shared/AuthApi";
import * as UserApi from "@/api/shared/UserApi";
import { appealBan } from "@/api/shared/AuthApi";
import { store } from "./store";
import { setCredentials } from "./store/accessToken/accessTokenSlice";
import { clearUser } from "./store/user/userSlice";
import { setUser } from "./store/user/userSlice";
import { logout } from "./store/accessToken/accessTokenSlice";
import { setBanned, clearBanned } from "./store/ban/banSlice";
import { setSystemTheme } from "./store/theme/themeSlice";
import SplashPage from "./pages/SplashPage/SplashPage";
import BannedNotification from "@/components/shared/BannedNotification/BannedNotification";
import { subscribeBanEvent } from "./socket";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const banState = useSelector((state) => state.ban);
  const theme = useSelector((state) => state.theme);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showAppealForm, setShowAppealForm] = useState(false);
  const [appealText, setAppealText] = useState("");
  const [appealSending, setAppealSending] = useState(false);
  const [appealSent, setAppealSent] = useState(false);
  const [appealError, setAppealError] = useState("");

  const publicPaths = ["/", "/admin/login", "/forgot-password"];
  const isPublicPath = publicPaths.includes(location.pathname);

  const handleBannedSocket = useCallback((payload) => {
    store.dispatch(setBanned({
      reason: payload.reason,
      bannedAt: payload.bannedAt,
    }));
  }, []);

  useEffect(() => {
    const initApp = async () => {
      if (isPublicPath) {
        setIsAuthReady(true);
        return;
      }

      try {
        const res = await AuthApi.refreshToken();

        if (!res?.data?.accessToken) {
          throw new Error("No access token");
        }

        if (res?.data?.accessToken) {
          store.dispatch(
            setCredentials({
              accessToken: res?.data?.accessToken,
            }),
          );

          const user = await UserApi.getUserInfo();
          store.dispatch(setUser(user?.data));
        } else {
          navigate("/admin/login");
          return;
        }
      } catch (error) {
        console.log(error);
        navigate("/admin/login");
      } finally {
        setIsAuthReady(true);
      }
    };

    initApp();
  }, [isPublicPath, navigate]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme.isDark);
  }, [theme.isDark]);

  useEffect(() => {
    if (theme.mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => store.dispatch(setSystemTheme());
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme.mode]);

  useEffect(() => {
    if (isAuthReady && !isPublicPath) {
      const unsub = subscribeBanEvent(handleBannedSocket);
      return () => unsub();
    }
  }, [isAuthReady, isPublicPath, handleBannedSocket]);

  const handleAppealSubmit = async () => {
    if (!appealText.trim()) return;
    setAppealSending(true);
    setAppealError("");
    try {
      await appealBan(appealText.trim());
      setAppealSent(true);
      setShowAppealForm(false);
    } catch (error) {
      setAppealError(error?.response?.data?.message || "Không thể gửi yêu cầu kháng cáo!");
    } finally {
      setAppealSending(false);
    }
  };

  const handleLogout = () => {
    store.dispatch(logout());
    store.dispatch(clearUser());
    store.dispatch(clearBanned());
    navigate("/admin/login");
  };

  if (!isAuthReady) {
    return <SplashPage />;
  }

  return (
    <>
      <Routes>
        {routes.map((route) => {
          const Component = route.component;
          const Layout = route.isAdmin ? AdminLayout : React.Fragment;

          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                <Layout>
                  <Component />
                </Layout>
              }
            />
          );
        })}
      </Routes>

      {banState.banned && !appealSent && !showAppealForm && (
        <BannedNotification
          reason={banState.banReason}
          onAppeal={() => setShowAppealForm(true)}
          onLogout={handleLogout}
        />
      )}

      {banState.banned && showAppealForm && (
        <div className="fixed inset-0 bg-slate-900/60 z-[99999] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-100 rounded-3xl max-w-md w-full mx-4 shadow-2xl overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Gửi yêu cầu kháng cáo</h3>
              <p className="text-sm text-gray-500 mb-4">
                Vui lòng trình bày lý do bạn cho rằng tài khoản bị khóa oan. Admin sẽ xem xét và phản hồi.
              </p>
              {appealError && (
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-red-50 border border-red-200 mb-4">
                  <span className="text-sm text-red-700 font-medium">{appealError}</span>
                </div>
              )}
              <textarea
                value={appealText}
                onChange={(e) => { setAppealText(e.target.value); setAppealError(""); }}
                placeholder="Nhập nội dung kháng cáo..."
                rows={5}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 resize-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowAppealForm(false); setAppealError(""); }}
                  className="flex-1 px-5 py-2.5 rounded-2xl bg-white dark:bg-gray-100 text-gray-700 hover:bg-gray-100 text-xs font-bold transition border border-gray-200 cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleAppealSubmit}
                  disabled={!appealText.trim() || appealSending}
                  className="flex-1 px-5 py-2.5 rounded-2xl bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-200 dark:text-white dark:hover:bg-gray-300 text-xs font-bold transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {appealSending ? "Đang gửi..." : "Gửi yêu cầu"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {banState.banned && appealSent && (
        <div className="fixed inset-0 bg-slate-900/60 z-[99999] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-100 rounded-3xl max-w-md w-full mx-4 shadow-2xl overflow-hidden">
            <div className="p-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-3xl bg-green-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Đã gửi yêu cầu kháng cáo</h3>
              <p className="text-sm text-gray-500 mb-6">
                Yêu cầu của bạn đã được ghi nhận. Admin sẽ xem xét và phản hồi sớm nhất.
              </p>
              <button
                onClick={handleLogout}
                className="w-full px-5 py-3 rounded-2xl bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-200 dark:text-white dark:hover:bg-gray-300 text-sm font-bold transition shadow-md cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
