// src/components/MapSection.jsx
import React, { useEffect, useRef } from "react";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { MAP_OPTIONS } from "../utils/constants";

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

  useEffect(() => {
    const resizeMap = () => {
      if (mapRef.current && window.google && window.google.maps) {
        window.google.maps.event.trigger(mapRef.current, "resize");
        mapRef.current.panTo(adminLocation);
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
      mapRef.current.panTo(adminLocation);
    }
  }, [adminLocation]);

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={adminLocation}
      zoom={13}
      options={MAP_OPTIONS}
      onLoad={handleMapLoad}
      onClick={onMapClick}
    >
      {/* Marker Admin Selalu Muncul */}
      <Marker
        position={adminLocation}
        label={{ text: "A", color: "white", fontWeight: "bold" }}
        title="Lokasi Admin (Jastiper)"
      />

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
    </GoogleMap>
  );
}
