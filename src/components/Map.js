"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const shopLoc = [-5.154633, 105.300084];

export default function Map({ distance, setDistance, setLocation }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !mapRef.current) {
      // Fix Leaflet marker icons
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      const map = L.map('map-container').setView(shopLoc, 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng(e.latlng);
        } else {
          markerRef.current = L.marker(e.latlng).addTo(map);
        }
        
        const dist = parseFloat((L.latLng(shopLoc).distanceTo(e.latlng) / 1000).toFixed(2));
        setDistance(dist);
        setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      const mapMove = (e) => {
        const { lat, lng } = e.detail;
        map.setView([lat, lng], 16);
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map);
        }
        const dist = parseFloat((L.latLng(shopLoc).distanceTo([lat, lng]) / 1000).toFixed(2));
        setDistance(dist);
      };
      window.addEventListener('map-move', mapMove);

      mapRef.current = map;
      return () => {
        window.removeEventListener('map-move', mapMove);
        map.remove();
        mapRef.current = null;
      };
    }
  }, [setDistance, setLocation]);

  return <div id="map-container" style={{ height: "200px", width: "100%", borderRadius: "16px", margin: "15px 0" }}></div>;
}
