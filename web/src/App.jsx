import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { routes } from "./routes";
import React, { useEffect, useState } from "react";
import AdminLayout from "@/layouts/AdminLayout/AdminLayout";
import * as AuthApi from "@/api/shared/AuthApi";
import * as UserApi from "@/api/shared/UserApi";
import { store } from "./store";
import { setCredentials } from "./store/accessToken/accessTokenSlice";
import { setUser } from "./store/user/userSlice";
import SplashPage from "./pages/SplashPage/SplashPage";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthReady, setIsAuthReady] = useState(false); // xử lý trạng thái auth
  const publicPaths = ["/", "/login", "/forgot-password"];
  const isPublicPath = publicPaths.includes(location.pathname);

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
          navigate("/login");
          return;
        }
      } catch (error) {
        console.log(error);
        navigate("/login");
      } finally {
        setIsAuthReady(true); // auth đã xong, cho phép render app
      }
    };

    initApp();
  }, [isPublicPath, navigate]);

  // CHẶN render cho tới khi auth xong
  if (!isAuthReady) {
    return <SplashPage />; // hoặc SplashScreen
  }

  return (
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
  );
}

export default App;
