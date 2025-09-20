import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapView = ({ locations }) => (
  <div className="h-96 w-full rounded shadow">
    <MapContainer
      center={[26.2, 93.9]}
      zoom={7}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {locations.map((loc, idx) => (
        <Marker key={idx} position={loc.position}>
          <Popup>
            <div>
              <strong>{loc.village}</strong>
              <br />
              Risk:{" "}
              <span
                className={
                  loc.risk === "High"
                    ? "text-red-600"
                    : loc.risk === "Medium"
                    ? "text-yellow-600"
                    : "text-green-600"
                }
              >
                {loc.risk}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  </div>
);

export default MapView;
