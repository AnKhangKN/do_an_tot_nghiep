import React from "react";

type ButtonProps = React.PropsWithChildren<
  React.ButtonHTMLAttributes<HTMLButtonElement>
>;

export default function ButtonComponent({
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    // shadow-md shadow-gray-800
    <button
      className={`
        inline-flex items-center justify-center gap-2
        h-10 px-4
        bg-blue-600 text-white
        rounded-xl

        shadow-md shadow-gray-400
        transition-all duration-100

        hover:bg-blue-700

        active:translate-y-0.5
        active:shadow-sm
        active:scale-98

        cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed

        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}