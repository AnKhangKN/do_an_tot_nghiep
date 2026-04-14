import React, { useState } from "react";
import * as AuthApi from "@/api/shared/AuthApi";
import * as UserApi from "@/api/shared/UserApi";
import { store } from "@/store";
import { setCredentials } from "@/store/accessToken/accessTokenSlice";
import { useNavigate } from "react-router-dom";
import { setUser } from "@/store/user/userSlice";

const LoginPage = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const { email, password, platform = "WEB" } = data;

      const accessToken = await AuthApi.login(email, password, platform);

      store.dispatch(setCredentials(accessToken?.data));
      const user = await UserApi.getUserInfo(accessToken?.data);

      store.dispatch(setUser(user?.data));
      navigate("/admin/dashboard");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-linear-to-br from-blue-500 to-indigo-600">
      <div className="bg-white w-100 p-8 rounded-2xl shadow-2xl">
        <div className="w-24 h-24 mb-6 rounded-xl overflow-hidden border mx-auto">
          <img src="/images/app_logo.png" alt="Logo" />
        </div>

        <h2 className="text-2xl font-bold text-center mb-2">ADMIN CỨU HỘ</h2>

        {/* Thêm onSubmit */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              value={data.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Password</label>
            <input
              type="password"
              name="password"
              value={data.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="text-right text-sm">
            <a href="#" className="text-blue-500 hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
