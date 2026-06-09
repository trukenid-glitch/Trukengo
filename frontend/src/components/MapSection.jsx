// src/components/MapSection.jsx
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { MAP_OPTIONS } from "../utils/constants";
import { ArrowLeft } from "lucide-react";

const containerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "400px",
};

export default function MapSection({
  adminLocation,
  storeLocation,
  customerLocation,
  directionsResponse,
  onMapClick,
}) {
  const mapRef = useRef(null);

  const navigate = useNavigate()

  const DEFAULT_CENTER = { lat: -6.9147, lng: 110.2037 };
  const isValidLatLng = (loc) =>
    loc && Number.isFinite(loc.lat) && Number.isFinite(loc.lng);

  useEffect(() => {
    const resizeMap = () => {
      if (mapRef.current && window.google && window.google.maps) {
        window.google.maps.event.trigger(mapRef.current, "resize");
        if (isValidLatLng(adminLocation)) mapRef.current.panTo(adminLocation);
      }
    };

    window.addEventListener("resize", resizeMap);
    return () => window.removeEventListener("resize", resizeMap);
  }, [adminLocation]);

  const handleMapLoad = (map) => {
    mapRef.current = map;
  };

  useEffect(() => {
    if (mapRef.current && window.google && window.google.maps) {
      window.google.maps.event.trigger(mapRef.current, "resize");
      if (isValidLatLng(adminLocation)) mapRef.current.panTo(adminLocation);
    }
  }, [adminLocation]);

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={isValidLatLng(adminLocation) ? adminLocation : DEFAULT_CENTER}
      zoom={13}
      options={MAP_OPTIONS}
      onLoad={handleMapLoad}
      onClick={onMapClick}
    >
      {/* Marker Admin Selalu Muncul */}
      {isValidLatLng(adminLocation) && (
        <Marker
          position={adminLocation}
          label={{ text: "A", color: "white", fontWeight: "bold" }}
          title="Lokasi Admin (Jastiper)"
        />
      )}

      {/* Tampilkan Marker satuan jika rute belum digambar */}
      {!directionsResponse && storeLocation && (
        <Marker
          position={storeLocation}
          label={{ text: "T", color: "white" }}
          title="Lokasi Toko"
        />
      )}

      {!directionsResponse && customerLocation && (
        <Marker
          position={customerLocation}
          label={{ text: "C", color: "white" }}
          title="Lokasi Customer"
        />
      )}

      {/* Render Rute jika sudah dihitung */}
      {directionsResponse && (
        <DirectionsRenderer
          directions={directionsResponse}
          options={{
            suppressMarkers: false, // Set true jika ingin pakai custom SVG marker
            polylineOptions: {
              strokeColor: "#3b82f6", // Blue Tailwind
              strokeWeight: 5,
              strokeOpacity: 0.8,
            },
          }}
        />
      )}

      <div className="relative flex items-center justify-between ml-3 mt-5">
        <div className=" items-center gap-3">
          {/* Tombol Back dengan Lingkaran Soft */}
          <button
            onClick={() => navigate("/")}
            className="group p-2 bg-slate-900 -mt-6 text-white rounded-2xl hover:bg-blue-600 transition-all duration-300 shadow-lg shadow-slate-900/20 active:scale-90"
          >
            <ArrowLeft
              size={20}
              strokeWidth={3}
              className="group-hover:-translate-x-1 transition-transform"
            />
          </button>
        </div>
      </div>
    </GoogleMap>
  );
}
