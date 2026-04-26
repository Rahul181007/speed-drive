import { getDistance } from "geolib";
import { Path } from "mongoose";

type PathPoint = {
  latitude: number;
  longitude: number;
  timestamp: string | Date;
  ignition: string;
  speed: number;
};

type OverspeedSegment = {
  start: { latitude: number; longitude: number };
  end: { latitude: number; longitude: number };
};

export type TripDocument = {
  name: string;
  distance: number;
  stoppageTime: number;
  idlingTime: number;
  path: PathPoint[];
  overspeedSegments: OverspeedSegment[];
  overspeedDistance: number;
};

type TableRow = {
  latitude: number;
  longitude: number;
  ignition: string;
  speed: number;
  fromTime: string | Date;
  toTime: string | Date;
};

export const getTripWIthPagination = (
  trip: TripDocument,
  page: number,
  limit: number
) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  // 🔹 Slice raw data
  const rawData = trip.path.slice(startIndex, endIndex);

  // 🔹 Convert to segment-based rows (IMPORTANT FIX)
  const paginatedData: TableRow[] = rawData
    .map((curr, index) => {
      const prev = rawData[index - 1];

      if (!prev) return null; // skip first row

      return {
        latitude: curr.latitude,
        longitude: curr.longitude,
        ignition: curr.ignition,
        speed: curr.speed,
        fromTime: prev.timestamp,
        toTime: curr.timestamp,
      };
    })
    .filter((row): row is TableRow => row !== null);

  // 🔹 FULL TRIP TRAVEL DURATION
  const fullStart = new Date(trip.path[0]?.timestamp);
  const fullEnd = new Date(
    trip.path[trip.path.length - 1]?.timestamp
  );

  const travelDurationSeconds =
    (fullEnd.getTime() - fullStart.getTime()) / 1000;

  // 🔹 FULL TRIP OVERSPEED DURATION
  let overspeedDurationSeconds = 0;

  for (let i = 1; i < trip.path.length; i++) {
    const prev = trip.path[i - 1];
    const curr = trip.path[i];

    if (curr.speed > 60) {
      const timeDiff =
        (new Date(curr.timestamp).getTime() -
          new Date(prev.timestamp).getTime()) / 1000;

      overspeedDurationSeconds += timeDiff;
    }
  }

  const segments=[];
  let currentSegment:PathPoint[] = [];

  for(let i=0;i<trip.path.length;i++){
    const point=trip.path[i];
    currentSegment.push(point);

    if(point.speed===0||point.ignition==="off"){
        if(currentSegment.length>1){
            segments.push({
                name:`Segment ${segments.length+1}`,
                path:[...currentSegment],
            })
    }
    currentSegment=[];
  }

  }

  if (currentSegment.length > 0) {
  segments.push({
    name: `Segment ${segments.length + 1}`,
    path: [...currentSegment],
  });
}


  return {
    data: paginatedData,
    total: trip.path.length,
    page,
    fullPath: trip.path,
    segments,
    tripMeta: {
      name: trip.name,
      distance: trip.distance,
      travelDuration: travelDurationSeconds,
      stoppageTime: trip.stoppageTime / 1000,
      idlingTime: trip.idlingTime / 1000,
      overspeedDistance: trip.overspeedDistance,
      overspeedDuration: overspeedDurationSeconds,
      overspeedSegments: trip.overspeedSegments,
    },
  };
};