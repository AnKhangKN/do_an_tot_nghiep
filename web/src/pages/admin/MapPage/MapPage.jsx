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
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

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
};

// ================= LAYERS =================
const DangerLayer = ({ data }) => (
  <>
    {data.map((item) => (
      <Marker key={item.id} position={item.position} icon={icons[item.type]}>
        <Popup>⚠️ {item.type}</Popup>
      </Marker>
    ))}
  </>
);

const DangerZoneLayer = ({ data }) => (
  <>
    {data.map((item) => (
      <Circle key={item.id} center={item.position} radius={item.radius}>
        <Popup>🔴 Vùng nguy hiểm</Popup>
      </Circle>
    ))}
  </>
);

const RepairLayer = ({ data }) => (
  <>
    {data.map((item) => (
      <Marker key={item.id} position={item.position} icon={icons.repair}>
        <Popup>🔧 {item.name}</Popup>
      </Marker>
    ))}
  </>
);

const RescuerLayer = ({ data }) => (
  <>
    {data.map((item) => (
      <Marker key={item.id} position={item.position} icon={icons.rescuer}>
        <Popup>🚑 {item.name}</Popup>
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
    <div className="absolute top-3 left-3 z-[1000] bg-white p-3 rounded shadow w-[320px]">
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

// ================= FLY =================
const FlyToLocation = ({ location }) => {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.flyTo(location, 15);
    }
  }, [location]);

  if (!location) return null;

  return (
    <Marker position={location}>
      <Popup>📍 Vị trí bạn tìm</Popup>
    </Marker>
  );
};

// ================= MAIN =================
const MapPage = () => {
  const center = [10.0452, 105.7469];
  const [location, setLocation] = useState(null);

  return (
    <div className="w-full h-[600px] relative">
      <SearchBox setLocation={setLocation} />

      <MapContainer center={center} zoom={13} className="w-full h-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <FlyToLocation location={location} />

        <LayersControl position="topright">
          <LayersControl.Overlay checked name="🚨 Điểm nguy hiểm">
            <DangerLayer data={dangerPoints} />
          </LayersControl.Overlay>

          <LayersControl.Overlay name="🔴 Vùng nguy hiểm">
            <DangerZoneLayer data={dangerPoints} />
          </LayersControl.Overlay>

          <LayersControl.Overlay name="🔧 Khu sửa xe">
            <RepairLayer data={repairShops} />
          </LayersControl.Overlay>

          <LayersControl.Overlay name="🚑 Cứu hộ">
            <RescuerLayer data={rescuers} />
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>
    </div>
  );
};

export default MapPage;