import Supercluster, { type ClusterFeature, type PointFeature } from 'supercluster';
import type { NomadPlace } from './types';

export type PlacePoint = { placeId: string };
export type PlaceCluster = ClusterFeature<Record<string, never>>;
export type MapPlaceFeature = PlaceCluster | PointFeature<PlacePoint>;

export function buildPlaceClusterIndex(places: readonly NomadPlace[]) {
  return new Supercluster<PlacePoint, Record<string, never>>({ radius: 50, maxZoom: 14, extent: 256 }).load(places.map(place => ({
    type: 'Feature', geometry: { type: 'Point', coordinates: [place.lon, place.lat] }, properties: { placeId: place.id },
  })));
}

export function isPlaceCluster(feature: MapPlaceFeature): feature is PlaceCluster {
  return 'cluster' in feature.properties && feature.properties.cluster === true;
}

export function clusterAppearance(count: number) {
  return count >= 200 ? { color: '#ef4444', size: 80 } : count >= 50 ? { color: '#8b5cf6', size: 60 } : { color: '#3b82f6', size: 40 };
}
