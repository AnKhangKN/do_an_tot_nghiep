import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { getSosHeatmap, searchLocations } from "@/api/admin/MapApi";
import { getApprovedDangerousZones } from "@/api/admin/DangerousZoneApi";
import { getApprovedAmenitiesPublic } from "@/api/admin/EmergencyAmenityApi";
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

// ================= DATA =================
// Dữ liệu thực được fetch từ API trong MapPage component

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

const amenityIcon = L.divIcon({
  className: "",
  html: `<div style="width:30px;height:30px;border-radius:50%;background:#dc2626;border:2px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,.3)">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="#fff">
      <rect x="6.5" y="0.5" width="3" height="15" rx="1"/>
      <rect x="0.5" y="6.5" width="15" height="3" rx="1"/>
    </svg>
  </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

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
const DangerLayer = ({ data }) => (
  <>
    {data.map((item) => (
      <Marker key={item.id} position={item.position} icon={icons[item.type] || icons.accident}>
        <Popup>
          <span className="flex items-center gap-1 font-medium">
            <PiWarningFill className="text-red-500" /> {item.name || item.type || "Điểm nguy hiểm"}
          </span>
        </Popup>
      </Marker>
    ))}
  </>
);

const dangerLevelRadius = { HIGH: 400, MEDIUM: 250, LOW: 150 };
const dangerLevelColor = { HIGH: "#dc2626", MEDIUM: "#f59e0b", LOW: "#eab308" };

const DangerZoneLayer = ({ data }) => (
  <>
    {data.map((item) => (
      <Circle
        key={item.id}
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
    ))}
  </>
);

const AmenityLayer = ({ data }) => (
  <>
    {data.map((item) => (
      <Marker key={item.id} position={item.position} icon={amenityIcon}>
        <Popup>
          <div className="p-1">
            <span className="flex items-center gap-1 font-medium">
              <PiHospitalFill className="text-red-600" /> {item.categoryName || "Tiện ích khẩn cấp"}
            </span>
            {item.name && <p className="text-sm text-gray-700 mt-1">{item.name}</p>}
            {item.phone && <p className="text-xs text-gray-500 mt-1">Điện thoại: {item.phone}</p>}
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


const SosMarkerLayer = ({ points }) => (
  <>
    {points.map((item) => (
      <Marker
        key={item.sosRequestId}
        position={[item.lat, item.lng]}
        icon={icons.sos}
      >
        <Popup>
          <div className="p-1">
            <h4 className="flex items-center gap-1 font-bold text-red-600">
              <PiSirenFill /> {item.incidentType}
            </h4>
            <p className="text-xs text-gray-600 mt-1">Trạng thái: <b>{item.status}</b></p>
            <p className="text-xs text-gray-500">Tọa độ: {item.lat.toFixed(4)}, {item.lng.toFixed(4)}</p>
          </div>
        </Popup>
      </Marker>
    ))}
  </>
);

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
  const [rescuers, setRescuers] = useState([]);
  const [myLocation, setMyLocation] = useState(null);
  const isDark = useSelector((state) => state.theme.isDark);

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

      // 3. Fetch Emergency Amenities
      try {
        const res = await getApprovedAmenitiesPublic();
        if (res && res.data && Array.isArray(res.data)) {
          const mappedAmenities = res.data
            .filter((item) => item.latitude && item.longitude)
            .map((item) => ({
              id: item.amenityId || item.id,
              position: [parseFloat(item.latitude), parseFloat(item.longitude)],
              name: item.name || item.categoryName || "Tiện ích khẩn cấp",
              categoryName: item.categoryName || "",
              phone: item.phone || "",
            }));
          setAmenities(mappedAmenities);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách tiện ích khẩn cấp:", err);
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

  return (
    <div className="w-full h-146 relative">
      <SearchBox setLocation={setLocation} />

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
        <AutoFitMapBounds dangerPoints={dangerPoints} amenities={amenities} />
        <MapControls onLocate={setMyLocation} />

        <LayersControl position="topright">
          <LayersControl.Overlay checked name="🔥 Heatmap điểm nóng">
            <HeatmapLayer points={heatmapPoints} />
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="⚠️ Điểm nguy hiểm">
            <DangerLayer data={dangerPoints} />
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="⭕ Vùng nguy hiểm">
            <DangerZoneLayer data={dangerPoints} />
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="🏥 Tiện ích khẩn cấp">
            <AmenityLayer data={amenities} />
          </LayersControl.Overlay>

          <LayersControl.Overlay name="🚑 Cứu hộ viên">
            <RescuerLayer data={rescuers} />
          </LayersControl.Overlay>
        </LayersControl>
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
            Tiện ích khẩn cấp: <b className="text-emerald-600">{amenities.length}</b>
          </span>
        </div>
      </div>
    </div>
  );
};

export default MapPage;