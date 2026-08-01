import React, { useEffect, useRef, useState } from "react";

// active: true khi section này đang được hiển thị (do StartPage truyền xuống)
const Reveal = ({ children, className = "", active }) => {
  const prefersReduced = useRef(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  // Nếu active được truyền vào thì dùng prop, nếu không dùng IntersectionObserver
  const useControlled = active !== undefined;

  const ref = useRef(null);
  const [visible, setVisible] = useState(() => {
    if (prefersReduced.current) return true;
    return useControlled ? active : false;
  });

  // Khi dùng prop active
  useEffect(() => {
    if (!useControlled) return;
    if (active) setVisible(true);
  }, [active, useControlled]);

  // Khi dùng IntersectionObserver (fallback)
  useEffect(() => {
    if (useControlled) return undefined;
    const node = ref.current;
    if (!node || visible) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [useControlled, visible]);

  return (
    <div
      ref={ref}
      className={`${className} transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
        prefersReduced.current || visible
          ? "translate-y-0 opacity-100"
          : "translate-y-5 opacity-0"
      }`}
    >
      {children}
    </div>
  );
};

export default Reveal;
