"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const shopLoc = [-5.154633, 105.300084];

export default function Map({ 
  distance, 
  setDistance, 
  setLocation, 
  initialLocation = null, 
  readonly = false,
  mapId = "map-container" 
}) {
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

      const startLoc = initialLocation ? [initialLocation.lat, initialLocation.lng] : shopLoc;
      const map = L.map(mapId).setView(startLoc, initialLocation ? 16 : 15);
      
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Add Shop Marker
      const shopIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/610/610365.png',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });
      L.marker(shopLoc, { icon: shopIcon }).addTo(map).bindPopup("La Misha Bakehouse");

      // Add Delivery Marker if exists
      if (initialLocation) {
        markerRef.current = L.marker([initialLocation.lat, initialLocation.lng]).addTo(map);
        // Draw line from shop to delivery
        L.polyline([shopLoc, [initialLocation.lat, initialLocation.lng]], { color: 'var(--primary)', dashArray: '5, 10' }).addTo(map);
      }

      if (!readonly) {
        map.on("click", (e) => {
          const { lat, lng } = e.latlng;
          if (markerRef.current) {
            markerRef.current.setLatLng(e.latlng);
          } else {
            markerRef.current = L.marker(e.latlng).addTo(map);
          }
          
          const dist = parseFloat((L.latLng(shopLoc).distanceTo(e.latlng) / 1000).toFixed(2));
          if (setDistance) setDistance(dist);
          if (setLocation) setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
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
          if (setDistance) setDistance(dist);
        };
        window.addEventListener('map-move', mapMove);

        mapRef.current = map;
        return () => {
          window.removeEventListener('map-move', mapMove);
          map.remove();
          mapRef.current = null;
        };
      }

      mapRef.current = map;
      return () => {
        map.remove();
        mapRef.current = null;
      };
    }
  }, [initialLocation, readonly, mapId, setDistance, setLocation]);

  return <div id={mapId} style={{ height: readonly ? "250px" : "200px", width: "100%", borderRadius: "16px", margin: "15px 0", border: "1px solid #eee" }}></div>;
}
