"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const shopLoc = [-5.154633, 105.300084];

export default function Map({ 
  distance, 
  setDistance, 
  setLocation, 
  setCourierLocation, // New prop
  initialLocation = null, 
  courierLocation = null,
  readonly = false,
  mapId = "map-container" 
}) {
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const courierMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    let isMounted = true;
    if (typeof window === "undefined") return;

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
      markerRef.current = L.marker([initialLocation.lat, initialLocation.lng]).addTo(map).bindPopup("Lokasi Tujuan");
    }

    const fetchRoute = async (lat, lng) => {
        try {
            const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${shopLoc[1]},${shopLoc[0]};${lng},${lat}?overview=full&geometries=geojson`);
            const data = await res.json();
            
            // Abort if this specific map instance was unmounted
            if (!isMounted) return;

            if (data.code === "Ok" && data.routes.length > 0) {
                const route = data.routes[0];
                const coords = route.geometry.coordinates.map(c => [c[1], c[0]]); // OSRM returns [lng, lat]
                
                if (routeLayerRef.current) {
                    map.removeLayer(routeLayerRef.current);
                }
                
                routeLayerRef.current = L.polyline(coords, { color: 'var(--primary)', weight: 4, opacity: 0.8 }).addTo(map);
                
                if (readonly && initialLocation) {
                    map.fitBounds(routeLayerRef.current.getBounds(), { padding: [30, 30] });
                }
                
                if (setDistance && !readonly) {
                    setDistance(parseFloat((route.distance / 1000).toFixed(2)));
                }
            }
        } catch (err) {
            console.error("Failed to fetch route:", err);
            if (!isMounted) return;
            // Fallback to straight line
            if (routeLayerRef.current) map.removeLayer(routeLayerRef.current);
            routeLayerRef.current = L.polyline([shopLoc, [lat, lng]], { color: 'var(--primary)', dashArray: '5, 10', weight: 2 }).addTo(map);
            if (setDistance && !readonly) setDistance(parseFloat((L.latLng(shopLoc).distanceTo([lat, lng]) / 1000).toFixed(2)));
        }
    };

    if (initialLocation) {
        fetchRoute(initialLocation.lat, initialLocation.lng);
    }

    if (!readonly) {
      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        
        if (setCourierLocation) {
          // Admin Mode: Update Courier Marker
          if (courierMarkerRef.current) {
            courierMarkerRef.current.setLatLng(e.latlng);
          } else {
            const courierIcon = L.divIcon({
              html: `
                <div style="
                  background: #fff;
                  width: 40px;
                  height: 40px;
                  border-radius: 50%;
                  border: 3px solid var(--primary);
                  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  position: relative;
                ">
                  <img src="https://cdn-icons-png.flaticon.com/512/2972/2972185.png" style="width: 25px; height: 25px;" />
                  <div style="
                    position: absolute;
                    bottom: -5px;
                    width: 0;
                    height: 0;
                    border-left: 5px solid transparent;
                    border-right: 5px solid transparent;
                    border-top: 5px solid var(--primary);
                  "></div>
                </div>
              `,
              className: '',
              iconSize: [40, 40],
              iconAnchor: [20, 45],
            });
            courierMarkerRef.current = L.marker(e.latlng, { icon: courierIcon }).addTo(map);
          }
          setCourierLocation({ lat, lng });
          return;
        }

        if (markerRef.current) {
          markerRef.current.setLatLng(e.latlng);
        } else {
          markerRef.current = L.marker(e.latlng).addTo(map);
        }
        
        fetchRoute(lat, lng);
        if (setLocation) setLocation({ lat, lng });
      });

      const mapMove = (e) => {
        const { lat, lng } = e.detail;
        map.setView([lat, lng], 16);
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map);
        }
        
        fetchRoute(lat, lng);
      };
      window.addEventListener('map-move', mapMove);

      mapInstanceRef.current = map;
      return () => {
        isMounted = false;
        window.removeEventListener('map-move', mapMove);
        try { map.remove(); } catch (err) {}
        mapInstanceRef.current = null;
        markerRef.current = null;
        courierMarkerRef.current = null;
        routeLayerRef.current = null;
      };
    }

    mapInstanceRef.current = map;
    return () => {
      isMounted = false;
      try { map.remove(); } catch (err) {}
      mapInstanceRef.current = null;
      markerRef.current = null;
      courierMarkerRef.current = null;
      routeLayerRef.current = null;
    };
  }, [initialLocation, readonly, mapId]);

  // Handle Courier Tracking Updates
  useEffect(() => {
    if (!mapInstanceRef.current || !courierLocation) return;

    const courierIcon = L.divIcon({
      html: `
        <div style="
          background: #fff;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid var(--primary);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <img src="https://cdn-icons-png.flaticon.com/512/2972/2972185.png" style="width: 25px; height: 25px;" />
          <div style="
            position: absolute;
            bottom: -5px;
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 5px solid var(--primary);
          "></div>
        </div>
      `,
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 45],
    });

    if (courierMarkerRef.current) {
      courierMarkerRef.current.setLatLng([courierLocation.lat, courierLocation.lng]);
    } else {
      courierMarkerRef.current = L.marker([courierLocation.lat, courierLocation.lng], { icon: courierIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup("Kurir Sedang Jalan!");
    }

    // Auto-adjust view to include courier and destination if moving
    if (initialLocation) {
        const bounds = L.latLngBounds([
            [initialLocation.lat, initialLocation.lng],
            [courierLocation.lat, courierLocation.lng]
        ]);
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

  }, [courierLocation, initialLocation]);

  return <div id={mapId} style={{ height: readonly ? "250px" : "200px", width: "100%", borderRadius: "16px", margin: "15px 0", border: "1px solid #eee" }}></div>;
}
