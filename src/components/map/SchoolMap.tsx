import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { School } from '@/data/rwandaSchools';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface SchoolMapProps {
  schools: School[];
  onSchoolSelect?: (school: School) => void;
  height?: string;
  showFilters?: boolean;
}

const statusColors: Record<string, string> = {
  Verified: '#22c55e',
  Pending: '#f59e0b',
  Unverified: '#94a3b8',
  Rejected: '#ef4444',
};

const createCustomIcon = (status: string) => {
  const color = statusColors[status] || statusColors.Unverified;
  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
          <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
        </svg>
      </div>
    `,
    className: 'custom-marker-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

export function SchoolMap({ schools, onSchoolSelect, height = '500px' }: SchoolMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Initialize map centered on Rwanda
    const map = L.map(mapContainer.current, {
      center: [-1.9403, 29.8739], // Rwanda center
      zoom: 8,
      zoomControl: false,
    });

    // Add zoom control to top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    // Create marker cluster group
    const markers = L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      maxClusterRadius: 60,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let size = 'small';
        if (count > 10) size = 'medium';
        if (count > 25) size = 'large';

        return L.divIcon({
          html: `<div style="
            background: hsl(173, 58%, 39%);
            color: white;
            width: ${size === 'large' ? 44 : size === 'medium' ? 38 : 32}px;
            height: ${size === 'large' ? 44 : size === 'medium' ? 38 : 32}px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: ${size === 'large' ? 14 : 12}px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            border: 3px solid white;
          ">${count}</div>`,
          className: 'marker-cluster',
          iconSize: L.point(size === 'large' ? 44 : size === 'medium' ? 38 : 32, size === 'large' ? 44 : size === 'medium' ? 38 : 32),
        });
      },
    });

    map.addLayer(markers);
    mapRef.current = map;
    markersRef.current = markers;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
    };
  }, []);

  // Update markers when schools change
  useEffect(() => {
    if (!markersRef.current) return;

    markersRef.current.clearLayers();

    schools.forEach((school) => {
      const marker = L.marker([school.coordinates.lat, school.coordinates.lng], {
        icon: createCustomIcon(school.verificationStatus),
      });

      const popupContent = `
        <div style="font-family: 'Inter', sans-serif; min-width: 240px;">
          <div style="padding: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="
                background: ${statusColors[school.verificationStatus]}20;
                color: ${statusColors[school.verificationStatus]};
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 600;
                text-transform: uppercase;
              ">${school.verificationStatus}</span>
              <span style="
                background: #f1f5f9;
                color: #64748b;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 500;
              ">${school.schoolType}</span>
            </div>
            <h3 style="font-weight: 600; font-size: 14px; margin: 0 0 4px 0; color: #1e293b;">
              ${school.name}
            </h3>
            <p style="font-size: 12px; color: #64748b; margin: 0 0 12px 0;">
              ${school.district}, ${school.sector}
            </p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
              <div>
                <span style="color: #94a3b8;">Level:</span>
                <span style="margin-left: 4px; color: #475569;">${school.educationLevel}</span>
              </div>
              <div>
                <span style="color: #94a3b8;">ID:</span>
                <span style="margin-left: 4px; color: #475569;">${school.id}</span>
              </div>
            </div>
            ${school.studentCount ? `
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
                <span style="font-size: 11px; color: #94a3b8;">Students: </span>
                <span style="font-size: 11px; color: #475569; font-weight: 500;">${school.studentCount}</span>
              </div>
            ` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: true,
        className: 'school-popup',
      });

      marker.on('click', () => {
        if (onSchoolSelect) {
          onSchoolSelect(school);
        }
      });

      markersRef.current?.addLayer(marker);
    });
  }, [schools, onSchoolSelect]);

  return (
    <div className="map-container relative rounded-xl overflow-hidden border bg-card">
      <div ref={mapContainer} style={{ height, width: '100%' }} />
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg border shadow-lg p-3 z-[1000]">
        <h4 className="text-xs font-semibold text-muted-foreground mb-2">Status Legend</h4>
        <div className="space-y-1.5">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-muted-foreground">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
