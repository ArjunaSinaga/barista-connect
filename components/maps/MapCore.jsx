"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// fix marker icon with CDN fallback (no local asset build issue)
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25,41], iconAnchor: [12,41], popupAnchor: [1,-34], shadowSize: [41,41]
});

function Clicker({ onPick }) {
  useMapEvents({
    click(e){ onPick(e.latlng.lat, e.latlng.lng); }
  });
  return null;
}

export default function MapCore({ pos, onPick }){
  useEffect(()=>{ delete L.Icon.Default.prototype._getIconUrl; L.Icon.Default.mergeOptions({ iconRetinaUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png", iconUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", shadowUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png" }); },[]);
  return (
    <MapContainer center={pos} zoom={12} scrollWheelZoom style={{height:320, width:"100%"}}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={pos} icon={icon} draggable eventHandlers={{ dragend(e){ const p=e.target.getLatLng(); onPick(p.lat,p.lng); } }} />
      <Clicker onPick={onPick} />
    </MapContainer>
  );
}
