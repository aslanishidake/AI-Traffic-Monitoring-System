// 道路状態
export type RoadStatus = 'smooth' | 'slow' | 'congested';

// 道路データ
export interface RoadData {
  id: string;
  name: string;
  status: RoadStatus;
  speed: number; // km/h
  coordinates: [number, number][];
}

// 交通イベント
export interface TrafficEvent {
  id: string;
  type: 'accident' | 'construction' | 'congestion';
  location: [number, number];
  time: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

// KPI データ
export interface KPIData {
  avgSpeed: number;
  congestionRate: number;
  activeEvents: number;
  smoothRoads: number;
}

// タイムスライス
export interface TimeSlice {
  timestamp: string;
  roads: RoadData[];
  events: TrafficEvent[];
  kpi: KPIData;
}
