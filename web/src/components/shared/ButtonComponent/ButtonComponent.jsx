import React from "react";

const ButtonComponent = ({ children="Button", className = "", ...props }) => {
  return (
    <button
      className={`border px-4 py-2 rounded-lg ${className} cursor-pointer hover:bg-gray-200 transition-colors duration-300`}
      {...props}
    >
      {children}
    </button>
  );
};

export default ButtonComponent;