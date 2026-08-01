import React, { useEffect, useRef, useState } from "react";
import { PiArrowCircleUpFill } from "react-icons/pi";
import { getPublicThesisInfo } from "@/api/public/PublicApi";
import HeroSectionComponent from "./components/HeroSectionComponent";
import StatsSectionComponent from "./components/StatsSectionComponent";
import FeaturesSectionComponent from "./components/FeaturesSectionComponent";
import HowItWorksSectionComponent from "./components/HowItWorksSectionComponent";
import TechStackSectionComponent from "./components/TechStackSectionComponent";
import ArchitectureSectionComponent from "./components/ArchitectureSectionComponent";
import EcosystemSectionComponent from "./components/EcosystemSectionComponent";
import DocumentationSectionComponent from "./components/DocumentationSectionComponent";
import FooterSectionComponent from "./components/FooterSectionComponent";

const TOTAL = 9;

const StartPage = () => {
  const [thesisInfo, setThesisInfo] = useState({});
  const [showBackToTop, setShowBackToTop] = useState(false);
  const scrollRef = useRef(null);
  const lockedRef = useRef(false);
  const indexRef = useRef(0);

  useEffect(() => {
    const fetchThesisInfo = async () => {
      try {
        const res = await getPublicThesisInfo();
        setThesisInfo(res?.data || {});
      } catch (error) {
        console.error("Fetch thesis info error:", error);
      }
    };
    fetchThesisInfo();
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return undefined;

    const isDesktop = () =>
      window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches;

    const getSections = () =>
      Array.from(container.querySelectorAll(":scope > div"));

    const scrollToIndex = (idx) => {
      const sections = getSections();
      if (idx < 0 || idx >= sections.length) return;
      lockedRef.current = true;
      indexRef.current = idx;
      setShowBackToTop(idx > 0);
      sections[idx].scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const onScrollEnd = () => {
      lockedRef.current = false;
    };

    const onWheel = (e) => {
      if (!isDesktop()) return;
      e.preventDefault();
      if (lockedRef.current) return;
      const dir = e.deltaY > 0 ? 1 : -1;
      const next = Math.max(0, Math.min(TOTAL - 1, indexRef.current + dir));
      if (next !== indexRef.current) scrollToIndex(next);
    };

    // Fallback cho browser chưa hỗ trợ scrollend
    let fallbackTimer = null;
    const onScroll = () => {
      setShowBackToTop(container.scrollTop > 100);
      if (!isDesktop()) return;
      clearTimeout(fallbackTimer);
      fallbackTimer = setTimeout(() => {
        lockedRef.current = false;
      }, 900);
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("scrollend", onScrollEnd, { passive: true });
    container.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("scrollend", onScrollEnd);
      container.removeEventListener("scroll", onScroll);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const goToTop = () => {
    indexRef.current = 0;
    setShowBackToTop(false);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      ref={scrollRef}
      className="h-dvh overflow-y-auto overflow-x-hidden overscroll-none bg-white text-gray-900 dark:bg-gray-50"
    >
      {/* Desktop: mỗi section chiếm đúng 1 màn hình h-dvh, animate theo activeIndex */}
      {/* Mobile: tất cả section xếp dọc cuộn tự nhiên, không bị giới hạn chiều cao */}

      <div className="h-auto lg:h-dvh lg:overflow-hidden">
        <HeroSectionComponent data={thesisInfo} />
      </div>
      <div className="h-auto lg:h-dvh lg:overflow-hidden">
        <StatsSectionComponent />
      </div>
      <div className="h-auto lg:h-dvh lg:overflow-hidden">
        <FeaturesSectionComponent />
      </div>
      <div className="h-auto lg:h-dvh lg:overflow-hidden">
        <HowItWorksSectionComponent />
      </div>
      <div className="h-auto lg:h-dvh lg:overflow-hidden">
        <TechStackSectionComponent />
      </div>
      <div className="h-auto lg:h-dvh lg:overflow-hidden">
        <ArchitectureSectionComponent />
      </div>
      <div className="h-auto lg:h-dvh lg:overflow-hidden">
        <EcosystemSectionComponent data={thesisInfo} />
      </div>
      <div className="h-auto lg:h-dvh lg:overflow-hidden">
        <DocumentationSectionComponent data={thesisInfo} />
      </div>
      <div className="h-auto lg:h-dvh lg:overflow-hidden">
        <FooterSectionComponent data={thesisInfo} />
      </div>

      <button
        type="button"
        aria-label="Trở về đầu trang"
        onClick={goToTop}
        className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/30 transition-all duration-300 hover:bg-red-500 ${
          showBackToTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <PiArrowCircleUpFill size={24} />
      </button>
    </div>
  );
};

export default StartPage;
