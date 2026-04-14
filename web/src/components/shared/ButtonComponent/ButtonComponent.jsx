import React from "react";

const ButtonComponent = ({ children, className = "", ...props }) => {
  return (
    <button
      className={`border px-4 py-2 rounded-lg ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default ButtonComponent;