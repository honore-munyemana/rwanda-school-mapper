import type { School } from '@/data/rwandaSchools';

export type SchoolGeoJSON = {
  features?: Array<{
    geometry?: { coordinates?: [number, number] };
    properties?: Record<string, unknown>;
  }>;
};

export function normalizeVerificationStatus(status: unknown): School['verificationStatus'] {
  const raw = String(status ?? 'Unverified').trim();
  if (raw === 'Verified' || raw === 'Pending' || raw === 'Unverified' || raw === 'Rejected') {
    return raw;
  }
  const normalized = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  if (
    normalized === 'Verified' ||
    normalized === 'Pending' ||
    normalized === 'Unverified' ||
    normalized === 'Rejected'
  ) {
    return normalized;
  }
  return 'Unverified';
}

export function parseSchoolsGeoJsonToSchools(geojson: SchoolGeoJSON): School[] {
  return (geojson.features || []).map((feature) => {
    const props = feature.properties || {};
    const coords = feature.geometry?.coordinates ?? [0, 0];
    const [lng, lat] = coords;

    return {
      id: String(props.id ?? ''),
      name: String(props.name || 'Unknown School'),
      province: 'N/A',
      district: String(props.district || 'Unknown District'),
      sector: 'N/A',
      coordinates: { lat, lng },
      schoolType: 'Public',
      educationLevel: 'Primary',
      verificationStatus: normalizeVerificationStatus(props.status),
      dateAdded: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
    };
  });
}
