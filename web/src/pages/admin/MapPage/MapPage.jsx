import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import React, { useEffect, useState, useMemo } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import "leaflet/dist/leaflet.css";
import { getSosHeatmap, searchLocations } from "@/api/admin/MapApi";
import { getApprovedDangerousZones } from "@/api/admin/DangerousZoneApi";
import { getApprovedAmenitiesPublic, getCategoriesAdmin } from "@/api/admin/EmergencyAmenityApi";
import { getRescuersAdmin } from "@/api/admin/RescuerApi";
import { useSelector } from "react-redux";
import {
  PiFireFill,
  PiMapPinFill,
  PiSirenFill,
  PiCircleFill,
  PiHospitalFill,
  PiAmbulanceFill,
  PiWarningFill,
  PiMagnifyingGlass,
  PiMapPin,
  PiX,
  PiPlus,
  PiMinus,
  PiCircleNotch,
  PiCrosshair,
  PiCaretDownBold,
  PiCaretUpBold,
  PiStackFill,
  PiStorefrontFill,
  PiCrossBold,
  PiFireBold,
  PiPoliceCarBold,
  PiGasPumpBold,
  PiWrenchBold,
  PiHouseBold,
  PiBowlFoodBold,
  PiStorefrontBold,
} from "react-icons/pi";

// ================= FIX ICON =================
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ================= ICON =================
const createIcon = (url) =>
  new L.Icon({
    iconUrl: url,
    iconSize: [30, 30],
  });

const icons = {
  fire: createIcon("https://cdn-icons-png.flaticon.com/512/482/482086.png"),
  accident: createIcon("https://cdn-icons-png.flaticon.com/512/296/296216.png"),
  rescuer: createIcon("https://cdn-icons-png.flaticon.com/512/149/149071.png"),
  sos: createIcon("https://cdn-icons-png.flaticon.com/512/564/564619.png"),
};

const AMENITY_ICONS = [
  { key: 'medical', label: 'Y tế / Cấp cứu', Icon: PiCrossBold, color: '#dc2626' },
  { key: 'fire', label: 'Chữa cháy / Cứu hỏa', Icon: PiFireBold, color: '#ea580c' },
  { key: 'police', label: 'Công an / Cảnh sát', Icon: PiPoliceCarBold, color: '#2563eb' },
  { key: 'gas', label: 'Trạm xăng / Nhiên liệu', Icon: PiGasPumpBold, color: '#d97706' },
  { key: 'repair', label: 'Sửa xe / Cứu hộ xe', Icon: PiWrenchBold, color: '#f97316' },
  { key: 'shelter', label: 'Nơi trú ẩn / Sơ tán', Icon: PiHouseBold, color: '#059669' },
  { key: 'food', label: 'Thực phẩm / Nước uống', Icon: PiBowlFoodBold, color: '#0d9488' },
  { key: 'store', label: 'Khác (Mặc định)', Icon: PiStorefrontBold, color: '#6b7280' },
];

const ICON_ALIASES = { wrench: 'repair', 'gas-pump': 'gas', 'first-aid': 'medical', tire: 'repair' };

const normalizeAmenityIcon = (iconName) => {
  if (!iconName) return null;
  const value = String(iconName).trim().toLowerCase();
  if (AMENITY_ICONS.some((i) => i.key === value)) return value;
  if (ICON_ALIASES[value]) return ICON_ALIASES[value];
  return null;
};

const createAmenityIcon = (categoryName = "", iconName = "") => {
  const name = categoryName.toLowerCase();

  let iconKey = normalizeAmenityIcon(iconName);
  if (!iconKey) {
    if (name.includes("sửa xe") || name.includes("cứu hộ xe") || name.includes("bảo dưỡng")) {
      iconKey = "repair";
    } else if (name.includes("xăng") || name.includes("nhiên liệu")) {
      iconKey = "gas";
    } else if (name.includes("trú") || name.includes("cứu nạn") || name.includes("tập kết")) {
      iconKey = "shelter";
    } else if (name.includes("cháy") || name.includes("cứu hỏa")) {
      iconKey = "fire";
    } else if (name.includes("ăn") || name.includes("nước") || name.includes("thực phẩm")) {
      iconKey = "food";
    } else if (name.includes("an") || name.includes("cảnh sát") || name.includes("công an")) {
      iconKey = "police";
    } else if (name.includes("y tế") || name.includes("bệnh viện") || name.includes("cấp cứu")) {
      iconKey = "medical";
    } else {
      iconKey = "store";
    }
  }

  const icon = AMENITY_ICONS.find((i) => i.key === iconKey);
  const IconComp = icon.Icon;
  const svgMarkup = renderToStaticMarkup(<IconComp className="w-4 h-4" />);

  return L.divIcon({
    className: "",
    html: `<div style="width:32px;height:32px;border-radius:50%;background:${icon.color};border:2px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.35);color:#fff" title="${categoryName}">
      ${svgMarkup}
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const myLocationIcon = L.divIcon({
  className: "",
  html: `<div style="width:30px;height:30px;border-radius:50%;background:#2563eb;border:2px solid #fff;box-shadow:0 0 0 6px rgba(37,99,235,.2);display:flex;align-items:center;justify-content:center">
    <div style="width:12px;height:12px;border-radius:50%;background:#fff"></div>
  </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// ================= HEATMAP LAYER =================
const HeatmapLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;

    const heatData = points.map((p) => [p.lat, p.lng, p.intensity || 0.8]);

    const heatLayer = L.heatLayer(heatData, {
      radius: 30,
      blur: 20,
      maxZoom: 17,
      gradient: { 0.4: "blue", 0.65: "lime", 0.8: "yellow", 1.0: "red" },
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
};

// ================= LAYERS =================
const dangerLevelRadius = { HIGH: 400, MEDIUM: 250, LOW: 150 };
const dangerLevelColor = { HIGH: "#dc2626", MEDIUM: "#f59e0b", LOW: "#eab308" };

const DangerLayer = ({ data }) => (
  <>
    {data.map((item) => (
      <React.Fragment key={item.id}>
        <Circle
          center={item.position}
          radius={item.radius}
          pathOptions={{ color: item.color || "#dc2626", fillOpacity: 0.15 }}
        >
          <Popup>
            <div className="p-1">
              <span className="flex items-center gap-1 font-medium">
                <PiCircleFill className="text-red-500" /> {item.name || "Vùng nguy hiểm"}
              </span>
              <p className="text-xs text-gray-600 mt-1">Mức độ: <b>{item.dangerLevel || "KHÔNG XÁC ĐỊNH"}</b></p>
            </div>
          </Popup>
        </Circle>
        <Marker position={item.position} icon={icons[item.type] || icons.accident}>
          <Popup>
            <span className="flex items-center gap-1 font-medium">
              <PiWarningFill className="text-red-500" /> {item.name || item.type || "Điểm nguy hiểm"}
            </span>
          </Popup>
        </Marker>
      </React.Fragment>
    ))}
  </>
);

const AmenityLayer = ({ data }) => (
  <>
    {data.map((item) => (
      <Marker key={item.id} position={item.position} icon={createAmenityIcon(item.categoryName, item.iconName)}>
        <Popup>
          <div className="p-1 min-w-[160px]">
            <span className="flex items-center gap-1.5 font-bold text-gray-900 text-sm">
              <PiHospitalFill className="text-red-600 shrink-0" /> {item.categoryName || "Tiện ích khẩn cấp"}
            </span>
            {item.name && <p className="text-xs font-semibold text-gray-800 mt-1">{item.name}</p>}
            {item.phone && (
              <p className="text-xs text-gray-600 mt-1 font-mono flex items-center gap-1">
                📞 {item.phone}
              </p>
            )}
          </div>
        </Popup>
      </Marker>
    ))}
  </>
);

const RescuerLayer = ({ data }) => (
  <>
    {data.map((item) => (
      <Marker key={item.id} position={item.position} icon={icons.rescuer}>
        <Popup>
          <span className="flex items-center gap-1 font-medium">
            <PiAmbulanceFill className="text-emerald-600" /> {item.name || "Cứu hộ viên"}
          </span>
        </Popup>
      </Marker>
    ))}
  </>
);

// ================= CUSTOM LAYER CONTROL PANEL =================
const LayerControlPanel = ({
  showHeatmap,
  setShowHeatmap,
  showDanger,
  setShowDanger,
  showAmenities,
  setShowAmenities,
  categories,
  selectedCategory,
  setSelectedCategory,
  amenities,
}) => {
  const [openAmenityList, setOpenAmenityList] = useState(true);
  const [panelExpanded, setPanelExpanded] = useState(true);

  // Thống kê số lượng tiện ích theo danh mục
  const categoryCounts = useMemo(() => {
    const counts = {};
    amenities.forEach((item) => {
      const name = item.categoryName || "Khác";
      counts[name] = (counts[name] || 0) + 1;
    });
    return counts;
  }, [amenities]);

  const uniqueCategoryNames = useMemo(() => {
    const namesFromAmenities = Object.keys(categoryCounts);
    const namesFromApi = categories.map((c) => c.categoryName).filter(Boolean);
    return Array.from(new Set([...namesFromAmenities, ...namesFromApi]));
  }, [categoryCounts, categories]);

  return (
    <div className="absolute top-4 right-4 z-[1000] w-[280px] bg-white/95 dark:bg-gray-100/95 backdrop-blur-md border border-gray-200 shadow-lg rounded-2xl overflow-hidden transition-all">
      {/* Header Panel */}
      <div
        onClick={() => setPanelExpanded(!panelExpanded)}
        className="flex items-center justify-between px-3.5 py-2.5 bg-gray-900 text-white cursor-pointer select-none"
      >
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
          <PiStackFill className="text-amber-400 text-sm" />
          Lớp Bản Đồ
        </span>
        {panelExpanded ? <PiCaretUpBold size={14} /> : <PiCaretDownBold size={14} />}
      </div>

      {panelExpanded && (
        <div className="p-2.5 space-y-2 text-xs font-medium text-gray-800">
          {/* 1. Heatmap */}
          <label className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors cursor-pointer">
            <span className="flex items-center gap-2">
              <span>🔥</span>
              <span>Heatmap điểm nóng SOS</span>
            </span>
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
              className="w-4 h-4 rounded text-gray-900 focus:ring-0 cursor-pointer"
            />
          </label>

          {/* 2. Danger Points */}
          <label className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors cursor-pointer">
            <span className="flex items-center gap-2">
              <span>⚠️</span>
              <span>Điểm & Vùng nguy hiểm</span>
            </span>
            <input
              type="checkbox"
              checked={showDanger}
              onChange={(e) => setShowDanger(e.target.checked)}
              className="w-4 h-4 rounded text-gray-900 focus:ring-0 cursor-pointer"
            />
          </label>

          {/* 3. Amenities (Bật/Tắt & Mở danh sách danh mục) */}
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50">
            <div className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors">
              <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={showAmenities}
                  onChange={(e) => {
                    setShowAmenities(e.target.checked);
                    if (e.target.checked) setOpenAmenityList(true);
                  }}
                  className="w-4 h-4 rounded text-gray-900 focus:ring-0 cursor-pointer"
                />
                <span className="truncate font-semibold flex items-center gap-1">
                  <span>🏥</span> Tiện ích khẩn cấp
                </span>
              </label>

              {showAmenities && (
                <button
                  type="button"
                  onClick={() => setOpenAmenityList(!openAmenityList)}
                  className="p-1 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Mở danh sách danh mục"
                >
                  {openAmenityList ? <PiCaretUpBold size={14} /> : <PiCaretDownBold size={14} />}
                </button>
              )}
            </div>

            {/* Sub-list các danh mục tiện ích */}
            {showAmenities && openAmenityList && (
              <div className="p-2 border-t border-gray-200 space-y-1 max-h-48 overflow-y-auto bg-white dark:bg-gray-50">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-1">
                  Chọn danh mục hiển thị:
                </p>

                {/* Chọn Tất cả danh mục */}
                <button
                  type="button"
                  onClick={() => setSelectedCategory("ALL")}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${selectedCategory === "ALL"
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <span className="flex items-center gap-1.5">
                    <PiStorefrontFill className={selectedCategory === "ALL" ? "text-amber-400" : "text-gray-400"} />
                    Tất cả tiện ích
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedCategory === "ALL"
                        ? "bg-gray-800 text-gray-200"
                        : "bg-gray-200 text-gray-700"
                      }`}
                  >
                    {amenities.length}
                  </span>
                </button>

                {/* Từng danh mục cụ thể */}
                {uniqueCategoryNames.map((catName) => {
                  const count = categoryCounts[catName] || 0;
                  const isSelected = selectedCategory === catName;
                  return (
                    <button
                      key={catName}
                      type="button"
                      onClick={() => setSelectedCategory(catName)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${isSelected
                          ? "bg-gray-900 text-white font-semibold"
                          : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      <span className="truncate pr-1">{catName}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] shrink-0 ${isSelected ? "bg-gray-800 text-gray-200" : "bg-gray-200 text-gray-700"
                          }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ================= SEARCH =================
const SearchBox = ({ setLocation }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = query.trim();

    if (q.length < 3) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const res = await searchLocations(q, 5);
        setResults(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        console.error("Lỗi khi tìm kiếm địa điểm:", err);
        setError(err?.response?.data?.message || "Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại!");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  const showEmptyState = !loading && !picked && !error && query.trim().length >= 3 && results.length === 0;

  return (
    <div className="absolute top-4 left-4 z-[1000] w-[320px] bg-white dark:bg-gray-100 border border-gray-200 shadow-md rounded-2xl overflow-hidden">
      <div className="relative flex items-center">
        <PiMagnifyingGlass className="absolute left-4 text-gray-400 pointer-events-none" size={18} />
        <input
          className="w-full py-3 pl-11 pr-12 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            setPicked(false);
            setError("");
            if (!value) setResults([]);
          }}
          placeholder="Tìm địa điểm tại Việt Nam..."
        />
        {query && (
          <button
            type="button"
            aria-label="Xóa tìm kiếm"
            onClick={() => {
              setQuery("");
              setPicked(false);
              setError("");
              setResults([]);
            }}
            className="absolute right-2 flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"
          >
            <PiX size={16} />
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500 border-t border-gray-200">
          <PiCircleNotch size={16} className="animate-spin text-gray-400" />
          Đang tìm kiếm...
        </div>
      )}

      {error && (
        <div className="px-4 py-3 text-sm text-red-600 border-t border-gray-200">
          {error}
        </div>
      )}

      {showEmptyState && (
        <div className="px-4 py-3 text-sm text-gray-500 border-t border-gray-200">
          Không tìm thấy địa điểm nào
        </div>
      )}

      {results.length > 0 && (
        <div className="max-h-60 overflow-y-auto border-t border-gray-200">
          {results.map((item) => (
            <button
              key={`${item.lat}_${item.lng}`}
              type="button"
              onClick={() => {
                setLocation([item.lat, item.lng]);
                setQuery(item.name || "");
                setPicked(true);
                setResults([]);
              }}
              className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors"
            >
              <PiMapPin className="mt-0.5 shrink-0 text-gray-400" size={18} />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-gray-900 truncate">
                  {item.name || "Không tên"}
                </span>
                <span className="block text-xs text-gray-500 truncate">
                  {item.city || ""}, {item.country || ""}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ================= CUSTOM MAP CONTROLS =================
const MyLocationMarker = ({ position }) => {
  if (!position) return null;

  return (
    <Marker position={position} icon={myLocationIcon}>
      <Popup>
        <span className="flex items-center gap-1">
          <PiCrosshair className="text-blue-600" /> Vị trí của bạn
        </span>
      </Popup>
    </Marker>
  );
};

const MapControls = ({ onLocate }) => {
  const map = useMap();
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState("");

  useEffect(() => {
    if (!locateError) return undefined;
    const timer = setTimeout(() => setLocateError(""), 4000);
    return () => clearTimeout(timer);
  }, [locateError]);

  const handleLocate = () => {
    if (!("geolocation" in navigator)) {
      setLocateError("Trình duyệt không hỗ trợ định vị.");
      return;
    }

    setLocating(true);
    setLocateError("");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        onLocate(coords);
        map.flyTo(coords, 15);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocateError("Bạn đã từ chối quyền truy cập vị trí.");
        } else {
          setLocateError("Không thể lấy vị trí hiện tại.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="absolute bottom-4 right-4 z-[1000] flex flex-col items-end gap-2">
      {locateError && (
        <div className="bg-white dark:bg-gray-100 border border-gray-200 shadow-md rounded-xl px-3 py-2 text-xs text-red-600 max-w-[220px]">
          {locateError}
        </div>
      )}

      <div className="flex flex-col bg-white dark:bg-gray-100 border border-gray-200 shadow-md rounded-2xl overflow-hidden">
        <button
          type="button"
          aria-label="Đến vị trí của tôi"
          onClick={handleLocate}
          className="flex items-center justify-center w-10 h-10 text-gray-700 hover:bg-gray-900 hover:text-white transition-colors"
        >
          {locating ? (
            <PiCircleNotch size={18} className="animate-spin" />
          ) : (
            <PiCrosshair size={18} weight="bold" />
          )}
        </button>
        <div className="h-px bg-gray-200" />
        <button
          type="button"
          aria-label="Phóng to bản đồ"
          onClick={() => map.zoomIn()}
          className="flex items-center justify-center w-10 h-10 text-gray-700 hover:bg-gray-900 hover:text-white transition-colors"
        >
          <PiPlus size={18} weight="bold" />
        </button>
        <div className="h-px bg-gray-200" />
        <button
          type="button"
          aria-label="Thu nhỏ bản đồ"
          onClick={() => map.zoomOut()}
          className="flex items-center justify-center w-10 h-10 text-gray-700 hover:bg-gray-900 hover:text-white transition-colors"
        >
          <PiMinus size={18} weight="bold" />
        </button>
      </div>
    </div>
  );
};

// ================= AUTO FIT MAP BOUNDS =================
const AutoFitMapBounds = ({ dangerPoints = [], amenities = [] }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const allCoords = [
      ...dangerPoints.map((d) => d.position),
      ...amenities.map((a) => a.position),
    ].filter((pos) => pos && pos[0] && pos[1] && !isNaN(pos[0]) && !isNaN(pos[1]));

    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [map, dangerPoints, amenities]);

  return null;
};

// ================= FLY =================
const FlyToLocation = ({ location }) => {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.flyTo(location, 15);
    }
  }, [location, map]);

  if (!location) return null;

  return (
    <Marker position={location}>
      <Popup>
        <span className="flex items-center gap-1">
          <PiMapPinFill className="text-red-500" /> Vị trí bạn tìm
        </span>
      </Popup>
    </Marker>
  );
};

// ================= MAIN =================
const MapPage = () => {
  const center = [10.0452, 105.7469];
  const [location, setLocation] = useState(null);
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [dangerPoints, setDangerPoints] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [rescuers, setRescuers] = useState([]);
  const [myLocation, setMyLocation] = useState(null);
  const isDark = useSelector((state) => state.theme.isDark);

  // State quản lý hiển thị các lớp
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showDanger, setShowDanger] = useState(true);
  const [showAmenities, setShowAmenities] = useState(true);
  const [showRescuers, setShowRescuers] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  useEffect(() => {
    const fetchMapData = async () => {
      // 1. Fetch Heatmap
      try {
        const res = await getSosHeatmap();
        if (res && res.data) {
          setHeatmapPoints(res.data);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu heatmap điểm nóng:", err);
      }

      // 2. Fetch Dangerous Points
      try {
        const res = await getApprovedDangerousZones();
        if (res && res.data && Array.isArray(res.data)) {
          const mappedPoints = res.data
            .filter((item) => item.latitude && item.longitude)
            .map((item) => {
              const dangerLevel = (item.dangerLevel || "LOW").toUpperCase();
              return {
                id: item.dangerousPointId || item.id,
                position: [parseFloat(item.latitude), parseFloat(item.longitude)],
                dangerLevel,
                type: dangerLevel === "HIGH" ? "fire" : "accident",
                name: item.zoneName || item.address || "Điểm nguy hiểm",
                radius: dangerLevelRadius[dangerLevel] || 200,
                color: dangerLevelColor[dangerLevel] || "#dc2626",
              };
            });
          setDangerPoints(mappedPoints);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách điểm nguy hiểm:", err);
      }

      // 3. Fetch Emergency Amenities & Categories
      try {
        const [categoriesRes, amenitiesRes] = await Promise.all([
          getCategoriesAdmin().catch(() => null),
          getApprovedAmenitiesPublic().catch(() => null),
        ]);

        if (categoriesRes && categoriesRes.data) {
          setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
        }

        if (amenitiesRes && amenitiesRes.data && Array.isArray(amenitiesRes.data)) {
          const mappedAmenities = amenitiesRes.data
            .filter((item) => item.latitude && item.longitude)
            .map((item) => ({
              id: item.amenityId || item.id,
              position: [parseFloat(item.latitude), parseFloat(item.longitude)],
              name: item.name || item.categoryName || "Tiện ích khẩn cấp",
              categoryName: item.categoryName || "Khác",
              iconName: item.iconName || "",
              categoryId: item.amenityCategoryId || item.categoryId || "",
              phone: item.phone || "",
            }));
          setAmenities(mappedAmenities);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu tiện ích khẩn cấp & danh mục:", err);
      }

      // 4. Fetch Rescuers
      try {
        const res = await getRescuersAdmin(1, 100);
        const rescuerList = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
        if (rescuerList.length > 0) {
          const mappedRescuers = rescuerList
            .filter((item) => (item.latitude || item.lat) && (item.longitude || item.lng))
            .map((item) => ({
              id: item.rescuerId || item.userId || item.id,
              position: [
                parseFloat(item.latitude || item.lat),
                parseFloat(item.longitude || item.lng),
              ],
              name: item.fullName || item.name || "Cứu hộ viên",
            }));
          setRescuers(mappedRescuers);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách cứu hộ viên:", err);
      }
    };

    fetchMapData();
  }, []);

  // Lọc tiện ích theo danh mục được chọn
  const filteredAmenities = useMemo(() => {
    if (selectedCategory === "ALL") return amenities;
    return amenities.filter(
      (item) => item.categoryName === selectedCategory || item.categoryId === selectedCategory
    );
  }, [amenities, selectedCategory]);

  return (
    <div className="w-full h-146 relative">
      <SearchBox setLocation={setLocation} />

      {/* Control Panel Tùy chỉnh Các Lớp & Danh mục */}
      <LayerControlPanel
        showHeatmap={showHeatmap}
        setShowHeatmap={setShowHeatmap}
        showDanger={showDanger}
        setShowDanger={setShowDanger}
        showAmenities={showAmenities}
        setShowAmenities={setShowAmenities}
        showRescuers={showRescuers}
        setShowRescuers={setShowRescuers}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        amenities={amenities}
      />

      <MapContainer center={center} zoom={13} zoomControl={false} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a> contributors'
          url={
            isDark
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          subdomains={isDark ? "abcd" : "abc"}
        />

        <FlyToLocation location={location} />
        <MyLocationMarker position={myLocation} />
        <AutoFitMapBounds dangerPoints={dangerPoints} amenities={filteredAmenities} />
        <MapControls onLocate={setMyLocation} />

        {/* Render Lớp bản đồ theo Toggle */}
        {showHeatmap && <HeatmapLayer points={heatmapPoints} />}
        {showDanger && <DangerLayer data={dangerPoints} />}
        {showAmenities && <AmenityLayer data={filteredAmenities} />}
        {showRescuers && <RescuerLayer data={rescuers} />}
      </MapContainer>

      {/* Thẻ thống kê điểm nguy hiểm & tiện ích */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 dark:bg-gray-100/90 backdrop-blur-md border border-gray-200 shadow-sm rounded-2xl p-3 flex items-center gap-4 text-xs font-medium text-gray-700">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          <span>
            Điểm nguy hiểm: <b className="text-red-600">{dangerPoints.length}</b>
          </span>
        </div>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>
            Tiện ích {selectedCategory !== "ALL" ? `(${selectedCategory})` : "khẩn cấp"}:{" "}
            <b className="text-emerald-600">{filteredAmenities.length}</b>
          </span>
        </div>
      </div>
    </div>
  );
};

export default MapPage;