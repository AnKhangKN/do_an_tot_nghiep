import React from "react";

const ButtonComponent = ({ children = "Button", className = "", ...props }) => {
  return (
    <button
      className={`border px-4 py-2 rounded-xl ${className} cursor-pointer transition-transform duration-300 hover:scale-105`}
      {...props}
    >
      {children}
    </button>
  );
};

export default ButtonComponent;