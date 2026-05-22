import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { School } from '@/data/rwandaSchools';
import { cn } from '@/lib/utils';
import { Layers, Map as MapIcon, Satellite, Flame, Navigation, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
}

const statusColors: Record<string, string> = {
  Verified: '#3D7A5C',
  Pending: '#D4A847',
  Unverified: '#8A9BAD',
  Rejected: '#ef4444',
};

const normalizeBackendSchool = (
  props: Record<string, unknown>,
  latlng: L.LatLng
): School => {
  const rawStatus = String(props.status ?? 'Unverified');
  const verificationStatus: School['verificationStatus'] =
    rawStatus === 'Verified' || rawStatus === 'Pending' || rawStatus === 'Rejected' || rawStatus === 'Unverified'
      ? rawStatus
      : 'Unverified';

  return {
    id: String(props.id ?? 'unknown'),
    name: String(props.name || 'Unknown School'),
    province: String(props.province || 'N/A'),
    district: String(props.district || 'Unknown District'),
    sector: String(props.sector || 'N/A'),
    coordinates: { lat: latlng.lat, lng: latlng.lng },
    schoolType: (props.schoolType as School['schoolType']) || 'Public',
    educationLevel: (props.educationLevel as School['educationLevel']) || 'Primary',
    verificationStatus,
    dateAdded: String(props.dateAdded || new Date().toISOString().split('T')[0]),
    lastUpdated: String(props.lastUpdated || new Date().toISOString().split('T')[0]),
    studentCount: Number(props.students ?? props.studentCount ?? 0) || undefined,
    teacherCount: props.teacherCount != null ? Number(props.teacherCount) : undefined,
  };
};

const createCustomIcon = (status: string) => {
  const color = statusColors[status] || statusColors.Unverified;
  const isPulsing = status === 'Unverified' || status === 'Rejected';

  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        ${isPulsing ? `<div class="absolute h-8 w-8 rounded-full bg-[${color}] opacity-20 animate-ping"></div>` : ''}
        <div style="
          background: ${color};
          width: 24px;
          height: 24px;
          border-radius: 6px;
          border: 2px solid rgba(255,255,255,0.1);
          box-shadow: 0 0 10px ${color}66;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(45deg);
        ">
          <div style="transform: rotate(-45deg)">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
              <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
            </svg>
          </div>
        </div>
      </div>
    `,
    className: 'custom-marker-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

export function SchoolMap({ schools, onSchoolSelect, height = '500px' }: SchoolMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);
  const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [backendSchools, setBackendSchools] = useState<any>(null);
  const [selectedSchoolForVerification, setSelectedSchoolForVerification] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

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

    // Initial tile layer - High Precision Dark Matrix
    const darkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CartoDB',
    });

    darkMatter.addTo(map);
    tileLayerRef.current = darkMatter;

    // Create marker cluster group
    const markers = L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 60,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div style="
            background: #C4622D;
            color: white;
            width: ${count > 25 ? 44 : count > 10 ? 38 : 32}px;
            height: ${count > 25 ? 44 : count > 10 ? 38 : 32}px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            font-weight: 800;
            border: 2px solid rgba(255,255,255,0.1);
            transform: rotate(45deg);
            box-shadow: 0 0 20px rgba(196,98,45,0.4);
          ">
            <span style="transform: rotate(-45deg); font-family: 'IBM Plex Mono', monospace; font-size: 10px;">${count}</span>
          </div>`,
          className: 'marker-cluster',
          iconSize: L.point(40, 40),
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

  // Fetch backend schools GeoJSON
  useEffect(() => {
    const fetchBackendSchools = async () => {
      try {
        const response = await fetch('http://localhost:5000/schools');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setBackendSchools(data);
      } catch (error) {
        console.error('Error fetching backend schools:', error);
      }
    };
    fetchBackendSchools();
  }, []);

  // Handle Map Type change
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;

    mapRef.current.removeLayer(tileLayerRef.current);

    if (mapType === 'streets') {
      tileLayerRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB',
      });
    } else {
      tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Esri',
      });
    }

    tileLayerRef.current.addTo(mapRef.current);
  }, [mapType]);

  // Update markers when schools change
  useEffect(() => {
    if (!markersRef.current) return;
    markersRef.current.clearLayers();

    schools.forEach((school) => {
      const marker = L.marker([school.coordinates.lat, school.coordinates.lng], {
        icon: createCustomIcon(school.verificationStatus),
      });

      marker.bindPopup(`<strong>${school.name}</strong><br/>${school.district}`, {
        closeButton: false,
      });

      marker.on('click', () => {
        onSchoolSelect?.(school);
        setSelectedSchoolForVerification({
          id: school.id,
          name: school.name,
          district: school.district,
          status: school.verificationStatus
        });
      });
      markersRef.current?.addLayer(marker);
    });

    // Add backend GeoJSON schools if they exist
    if (backendSchools && backendSchools.features) {
      const geoJsonLayer = L.geoJSON(backendSchools, {
        pointToLayer: (feature, latlng) => {
          const props = feature?.properties || {};
          const marker = L.marker(latlng, {
            icon: createCustomIcon('Verified'), // default to Verified or map from feature properties
          });
          
          marker.bindPopup(`
            <div>
              <strong>${props.name || "Unknown School"}</strong><br/>
              District: ${props.district || "Unknown District"}<br/>
              Lat: ${latlng.lat?.toFixed(6)}<br/>
              Lng: ${latlng.lng?.toFixed(6)}
            </div>
          `, {
            closeButton: false,
          });
          
          marker.on('click', () => {
            const normalized = normalizeBackendSchool(props, latlng);
            onSchoolSelect?.(normalized);
            setSelectedSchoolForVerification({
              id: normalized.id,
              name: normalized.name,
              district: normalized.district,
              status: normalized.verificationStatus,
            });
          });
          
          return marker;
        }
      });
      markersRef.current.addLayer(geoJsonLayer);
    }
  }, [schools, onSchoolSelect, backendSchools]);

  const handleVerifyGPS = () => {
    if (!selectedSchoolForVerification) return;
    setIsVerifying(true);

    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setIsVerifying(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch('http://localhost:5000/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              school_id: parseInt(selectedSchoolForVerification.id) || selectedSchoolForVerification.properties?.id,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              notes: 'Verified via GPS by field officer',
            }),
          });

          const data = await response.json();

          if (response.ok) {
            toast.success('School verified successfully');
            setSelectedSchoolForVerification((prev: any) => ({ ...prev, status: 'Verified' }));
          } else {
            toast.error(data.error || 'Too far from school to verify');
          }
        } catch (error) {
          toast.error('Failed to verify school');
        } finally {
          setIsVerifying(false);
        }
      },
      (error) => {
        toast.error('Failed to get location: ' + error.message);
        setIsVerifying(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="map-container relative rounded-xl overflow-hidden border border-white/5 bg-black">
      <div ref={mapContainer} style={{ height, width: '100%' }} />

      {/* Map Layers Toggle */}
      <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-4">
        <div className="bg-[#0F1923]/80 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl p-1.5 flex items-center gap-1.5">
          <Button
            variant={mapType === 'streets' ? 'default' : 'ghost'}
            size="sm"
            className={cn(
              "h-9 rounded-lg px-4 text-[10px] font-black uppercase tracking-widest transition-all",
              mapType === 'streets' ? "bg-[#C4622D] text-white" : "text-[#8A9BAD] hover:text-white"
            )}
            onClick={() => setMapType('streets')}
          >
            <MapIcon className="h-3.5 w-3.5 mr-2" />
            Matrix
          </Button>
          <Button
            variant={mapType === 'satellite' ? 'default' : 'ghost'}
            size="sm"
            className={cn(
              "h-9 rounded-lg px-4 text-[10px] font-black uppercase tracking-widest transition-all",
              mapType === 'satellite' ? "bg-[#C4622D] text-white" : "text-[#8A9BAD] hover:text-white"
            )}
            onClick={() => setMapType('satellite')}
          >
            <Satellite className="h-3.5 w-3.5 mr-2" />
            Satellite
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 rounded-xl border-white/10 bg-[#0F1923]/80 backdrop-blur-md flex items-center gap-2 px-4 shadow-2xl group transition-all",
            showHeatmap ? "text-[#D4A847] border-[#D4A847]/40 ring-2 ring-[#D4A847]/10" : "text-[#8A9BAD]"
          )}
          onClick={() => setShowHeatmap(!showHeatmap)}
        >
          <Flame className={cn("h-3.5 w-3.5 transition-transform", showHeatmap && "animate-pulse")} />
          <span className="text-[10px] font-black uppercase tracking-widest">Heat Profile</span>
        </Button>
      </div>

      {/* Map Legend - Tactical Layout */}
      <div className="absolute bottom-6 left-6 bg-[#0F1923]/90 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl p-4 z-[1000] min-w-[160px]">
        <h4 className="text-[9px] uppercase font-black text-[#D4A847] mb-4 flex items-center justify-between tracking-[0.2em]">
          <span>LEGEND_LOG</span>
          <Layers className="h-3 w-3 opacity-40" />
        </h4>
        <div className="space-y-3">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center justify-between group cursor-default">
              <div className="flex items-center gap-3">
                <div
                  className="w-2.5 h-2.5 rounded-sm shadow-sm transition-transform group-hover:scale-125 group-hover:rotate-45"
                  style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}66` }}
                />
                <span className="text-[10px] font-bold text-[#8A9BAD] uppercase tracking-wider group-hover:text-white transition-colors">{status}</span>
              </div>
              <div className="h-px flex-1 mx-3 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>

      {/* Coordinate HUD */}
      <div className="absolute top-6 right-16 z-[1000] hidden md:block">
        <div className="bg-black/40 backdrop-blur-md rounded-lg border border-white/5 py-2 px-4 flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[8px] font-mono text-[#8A9BAD]/40 uppercase tracking-widest">Sector Radar</span>
            <span className="text-[10px] font-mono font-bold text-[#3D7A5C]">AES_256_ACTIVE</span>
          </div>
          <div className="h-6 w-px bg-white/5" />
          <div className="flex flex-col">
            <span className="text-[8px] font-mono text-[#8A9BAD]/40 uppercase tracking-widest">Local Time</span>
            <span className="text-[10px] font-mono font-bold text-white uppercase italic">{new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })} CAT</span>
          </div>
        </div>
      </div>

      {/* Heatmap Overlay Simulation */}
      {showHeatmap && (
        <div className="absolute inset-0 pointer-events-none z-[400] overflow-hidden opacity-30">
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/0 via-red-500/20 to-yellow-500/0 blur-[80px] animate-pulse" />
        </div>
      )}

      {/* Verification Panel */}
      {selectedSchoolForVerification && (
        <div className="absolute bottom-6 right-6 bg-[#0F1923]/90 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl p-4 z-[1000] min-w-[280px]">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-[12px] font-bold text-white leading-tight">
              {selectedSchoolForVerification.name ?? 'Unknown School'}
            </h4>
            <button 
              onClick={() => setSelectedSchoolForVerification(null)}
              className="text-[#8A9BAD] hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[10px] text-[#8A9BAD] mb-4">{selectedSchoolForVerification.district ?? 'N/A'}</p>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase font-bold text-[#8A9BAD]">Status</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-white/5" style={{ color: statusColors[selectedSchoolForVerification.status] || statusColors.Unverified }}>
              {selectedSchoolForVerification.status}
            </span>
          </div>

          <Button 
            className={cn(
              "w-full h-9 text-white text-[11px] font-bold uppercase tracking-wider transition-all",
              selectedSchoolForVerification.status === 'Verified' ? "bg-white/10 hover:bg-white/10 opacity-50 cursor-not-allowed" : "bg-[#C4622D] hover:bg-[#C4622D]/80"
            )}
            onClick={handleVerifyGPS}
            disabled={isVerifying || selectedSchoolForVerification.status === 'Verified'}
          >
            {isVerifying ? (
              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5 mr-2" />
            )}
            {selectedSchoolForVerification.status === 'Verified' ? 'Verified' : 'Verify via GPS'}
          </Button>
        </div>
      )}
    </div>
  );
}
