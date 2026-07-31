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
import { getSosHeatmap } from "@/api/admin/MapApi";
import { useSelector } from "react-redux";
import {
  PiFireFill,
  PiMapPinFill,
  PiSirenFill,
  PiCircleFill,
  PiWrenchFill,
  PiAmbulanceFill,
  PiWarningFill,
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
const dangerPoints = [
  { id: 1, position: [10.0452, 105.7469], type: "fire", radius: 200 },
  { id: 2, position: [10.05, 105.75], type: "accident", radius: 150 },
];

const repairShops = [
  { id: 1, position: [10.048, 105.748], name: "Tiệm sửa xe A" },
  { id: 2, position: [10.043, 105.742], name: "Tiệm sửa xe B" },
];

const rescuers = [
  { id: 1, position: [10.046, 105.744], name: "Cứu hộ 1" },
  { id: 2, position: [10.047, 105.749], name: "Cứu hộ 2" },
];

// ================= ICON =================
const createIcon = (url) =>
  new L.Icon({
    iconUrl: url,
    iconSize: [30, 30],
  });

const icons = {
  fire: createIcon("https://cdn-icons-png.flaticon.com/512/482/482086.png"),
  accident: createIcon("https://cdn-icons-png.flaticon.com/512/296/296216.png"),
  repair: createIcon("https://cdn-icons-png.flaticon.com/512/684/684908.png"),
  rescuer: createIcon("https://cdn-icons-png.flaticon.com/512/149/149071.png"),
  sos: createIcon("https://cdn-icons-png.flaticon.com/512/564/564619.png"),
};

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
      <Marker key={item.id} position={item.position} icon={icons[item.type]}>
        <Popup>
          <span className="flex items-center gap-1">
            <PiWarningFill className="text-red-500" /> {item.type}
          </span>
        </Popup>
      </Marker>
    ))}
  </>
);

const DangerZoneLayer = ({ data }) => (
  <>
    {data.map((item) => (
      <Circle key={item.id} center={item.position} radius={item.radius}>
        <Popup>
          <span className="flex items-center gap-1">
            <PiCircleFill className="text-red-500" /> Vùng nguy hiểm
          </span>
        </Popup>
      </Circle>
    ))}
  </>
);

const RepairLayer = ({ data }) => (
  <>
    {data.map((item) => (
      <Marker key={item.id} position={item.position} icon={icons.repair}>
        <Popup>
          <span className="flex items-center gap-1">
            <PiWrenchFill className="text-orange-500" /> {item.name}
          </span>
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
          <span className="flex items-center gap-1">
            <PiAmbulanceFill className="text-emerald-600" /> {item.name}
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
const removeVietnameseTones = (str) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const SearchBox = ({ setLocation }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();

    if (q.length < 3) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);

      try {
        const clean = removeVietnameseTones(q);
        const keyword = encodeURIComponent(clean + " Vietnam");

        // ===== PHOTON =====
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${keyword}&limit=5&bbox=102,8,110,24`,
          {
            headers: {
              "User-Agent": "rescue-app",
            },
          }
        );

        if (!res.ok) throw new Error("Photon lỗi");

        const data = await res.json();

        const filtered = (data.features || []).filter(
          (item) => item.properties.countrycode === "VN"
        );

        setResults(filtered);
      } catch (err) {
        console.log(err);
        try {
          const keyword = encodeURIComponent(q + " Vietnam");

          const res2 = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${keyword}&limit=5&countrycodes=vn`
          );

          const data2 = await res2.json();

          const formatted = data2.map((item) => ({
            geometry: {
              coordinates: [parseFloat(item.lon), parseFloat(item.lat)],
            },
            properties: {
              name: item.display_name,
              city: "",
              country: "Vietnam",
            },
          }));

          setResults(formatted);
        } catch (error) {
          console.log(error);
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  return (
    <div className="absolute top-3 left-3 z-1000 bg-white dark:bg-gray-100 p-3 rounded shadow w-[320px]">
      <input
        className="border p-2 w-full"
        value={query}
        onChange={(e) => {
          const value = e.target.value;
          setQuery(value);
          if (!value) setResults([]);
        }}
        placeholder="Nhập địa chỉ tại Việt Nam..."
      />

      <div className="mt-2 max-h-[200px] overflow-auto">
        {loading && <div className="p-2 text-gray-500">Đang tìm...</div>}

        {!loading && results.length === 0 && query.length >= 3 && (
          <div className="p-2 text-gray-500">Không tìm thấy</div>
        )}

        {results.map((item) => {
          const [lon, lat] = item.geometry.coordinates;

          return (
            <div
              key={item.properties.osm_id || Math.random()}
              onClick={() => {
                setLocation([lat, lon]);
                setQuery(item.properties.name || "");
                setResults([]);
              }}
              className="p-2 hover:bg-gray-200 cursor-pointer text-sm"
            >
              <b>{item.properties.name || "Không tên"}</b>
              <br />
              <small>
                {item.properties.city || ""}, {item.properties.country || ""}
              </small>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ================= AUTO FIT HEATMAP BOUNDS =================
const AutoFitHeatmap = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;
    const validPoints = points
      .filter((p) => p.lat && p.lng && !isNaN(p.lat) && !isNaN(p.lng))
      .map((p) => [p.lat, p.lng]);

    if (validPoints.length > 0) {
      const bounds = L.latLngBounds(validPoints);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [map, points]);

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
  const isDark = useSelector((state) => state.theme.isDark);

  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        const res = await getSosHeatmap();
        if (res && res.data) {
          setHeatmapPoints(res.data);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu heatmap điểm nóng:", err);
      }
    };

    fetchHeatmapData();
  }, []);

  const activeHotspotCount = heatmapPoints.filter((p) =>
    ["PENDING", "SEARCHING", "ASSIGNED", "IN_PROGRESS"].includes(p.status)
  ).length;

  return (
    <div className="w-full h-146 relative">
      <SearchBox setLocation={setLocation} />

      <MapContainer center={center} zoom={13} className="w-full h-full">
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
        <AutoFitHeatmap points={heatmapPoints} />

        <LayersControl position="topright">
          <LayersControl.Overlay checked name={<span className="flex items-center gap-1"><PiFireFill className="text-red-500" /> Điểm nóng tai nạn (Heatmap)</span>}>
            <HeatmapLayer points={heatmapPoints} />
          </LayersControl.Overlay>

          <LayersControl.Overlay name={<span className="flex items-center gap-1"><PiMapPinFill className="text-red-500" /> Vị trí SOS Cứu hộ</span>}>
            <SosMarkerLayer points={heatmapPoints} />
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name={<span className="flex items-center gap-1"><PiSirenFill className="text-red-500" /> Điểm nguy hiểm</span>}>
            <DangerLayer data={dangerPoints} />
          </LayersControl.Overlay>

          <LayersControl.Overlay name={<span className="flex items-center gap-1"><PiCircleFill className="text-red-500" /> Vùng nguy hiểm</span>}>
            <DangerZoneLayer data={dangerPoints} />
          </LayersControl.Overlay>

          <LayersControl.Overlay name={<span className="flex items-center gap-1"><PiWrenchFill className="text-orange-500" /> Khu sửa xe</span>}>
            <RepairLayer data={repairShops} />
          </LayersControl.Overlay>

          <LayersControl.Overlay name={<span className="flex items-center gap-1"><PiAmbulanceFill className="text-emerald-600" /> Cứu hộ</span>}>
            <RescuerLayer data={rescuers} />
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>

      {/* Thẻ thống kê điểm nóng trực quan */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 dark:bg-gray-100/90 backdrop-blur-md border border-gray-200 shadow-sm rounded-2xl p-3 flex items-center gap-4 text-xs font-medium text-gray-700">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          <span>
            Tổng số điểm SOS: <b className="text-gray-900">{heatmapPoints.length}</b>
          </span>
        </div>
        <div className="h-4 w-px bg-gray-200" />
        <div>
          Đang xử lý: <b className="text-amber-600">{activeHotspotCount}</b>
        </div>
      </div>
    </div>
  );
};

export default MapPage;