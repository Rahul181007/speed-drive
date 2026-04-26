import fs from "fs"
import csv from "csv-parser"
import { getDistance } from "geolib";

type RawCSVRow = {
    latitude: string;
    longitude: string;
    timestamp: string;
    ignition: string;
};
type GPSData = {
    latitude: number;
    longitude: number;
    timestamp: Date;
    ignition: string;
};

type SpeedInfo = {
    speed: number,
    isOverSpeed: boolean
}

type OverspeedSegment = {
    start: { latitude: number; longitude: number };
    end: { latitude: number; longitude: number };
};


const getSpeedKmh = (prev: GPSData, curr: GPSData): number => {
    const distance = getDistance(
        { latitude: prev.latitude, longitude: prev.longitude },
        { latitude: curr.latitude, longitude: curr.longitude }
    );

    const timeDiff = curr.timestamp.getTime() - prev.timestamp.getTime();
    const timeInSeconds = timeDiff / 1000;

    if (timeInSeconds === 0) return 0;

    const speed = distance / timeInSeconds;
    return speed * 3.6;
};


export const parsedCsv = (filePath: string): Promise<RawCSVRow[]> => {
    const results: RawCSVRow[] = [];

    return new Promise((resolve, reject) => {

        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => {
                results.push(row);
            })
            .on("end", () => {
                resolve(results);
            })
            .on("error", (err) => {
                reject(err);
            });

    });
}


export const cleanData = (data: RawCSVRow[]): GPSData[] => {
    return data.map(row => ({
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        timestamp: new Date(row.timestamp),
        ignition: row.ignition.trim().toLowerCase()
    }))
}

export const calculateTotalDistance = (data: GPSData[]): number => {
    let totalDistance = 0;
    for (let i = 1; i < data.length; i++) {
        const curr = data[i];
        const prev = data[i - 1];
        const distance = getDistance(
            { latitude: prev.latitude, longitude: prev.longitude },
            { latitude: curr.latitude, longitude: curr.longitude }
        )
        totalDistance += distance
    }
    return totalDistance
}

export const calculateSpeeds = (data: GPSData[]): SpeedInfo[] => {
    const speeds: SpeedInfo[] = [];

    for (let i = 1; i < data.length; i++) {
        const curr = data[i];
        const prev = data[i - 1];

        const speedKmh = getSpeedKmh(prev, curr)


        const isOverSpeed = speedKmh > 60
        speeds.push({ speed: speedKmh, isOverSpeed: isOverSpeed })

    }
    return speeds
}



export const calculateIdlingDuration = (data: GPSData[]): number => {
    let totalIdlingTime = 0;
    let idleStartTime: Date | null = null;

    for (let i = 1; i < data.length; i++) {
        const curr = data[i];
        const prev = data[i - 1];

        const distance = getDistance(
            { latitude: prev.latitude, longitude: prev.longitude },
            { latitude: curr.latitude, longitude: curr.longitude }
        );

        const isIdling = curr.ignition === "on" && distance < 5

        if (isIdling && idleStartTime === null) {
            idleStartTime = curr.timestamp
        }

        if (!isIdling && idleStartTime !== null) {
            const duration = curr.timestamp.getTime() - idleStartTime.getTime();

            totalIdlingTime += duration;
            idleStartTime = null;
        }
    }

    if (idleStartTime !== null) {
        const lastTime = data[data.length - 1].timestamp;
        const duration = lastTime.getTime() - idleStartTime.getTime();
        totalIdlingTime += duration;
    }

    return totalIdlingTime;
}



export const calculateStoppageDuration = (data: GPSData[]): number => {
    let totalStoppageTime = 0;
    let stopStartTime: Date | null = null;

    for (let i = 0; i < data.length; i++) {
        const curr = data[i];

        if (curr.ignition === "off" && stopStartTime === null) {
            stopStartTime = curr.timestamp
        }

        if (curr.ignition === "on" && stopStartTime !== null) {
            const duration = curr.timestamp.getTime() - stopStartTime.getTime();

            totalStoppageTime += duration;
            stopStartTime = null
        }

    }

    if (stopStartTime !== null) {
        const lastTime = data[data.length - 1].timestamp;
        const duration = lastTime.getTime() - stopStartTime.getTime();
        totalStoppageTime += duration;
    }
    return totalStoppageTime
}

export const getOverspeedSegments = (data: GPSData[]): OverspeedSegment[] => {
    const segments: OverspeedSegment[] = [];

    for (let i = 1; i < data.length; i++) {
        const curr = data[i];
        const prev = data[i - 1];

        const speedKmh = getSpeedKmh(prev, curr);

        if (speedKmh > 60) {
            segments.push({
                start: { latitude: prev.latitude, longitude: prev.longitude },
                end: { latitude: curr.latitude, longitude: curr.longitude }
            });
        }
    }

    return segments;
}

export const calculateOverspeedDistance=(data: GPSData[]): number => {
    let totalOverspeedDistance = 0;

    for (let i = 1; i < data.length; i++) {
        const curr = data[i];
        const prev = data[i - 1];

        const speedKmh = getSpeedKmh(prev, curr);

        if (speedKmh > 60) {
            const distance = getDistance(
                { latitude: prev.latitude, longitude: prev.longitude },
                { latitude: curr.latitude, longitude: curr.longitude }
            );
            totalOverspeedDistance += distance;
        }
    }

    return totalOverspeedDistance;
}


export const buildPath = (cleaned: GPSData[]) => {
  return cleaned.map((p, index) => {
    let speed = 0;

    if (index > 0) {
      const prev = cleaned[index - 1];

      const distance = getDistance(
        { latitude: prev.latitude, longitude: prev.longitude },
        { latitude: p.latitude, longitude: p.longitude }
      );

      const timeDiff =
        (p.timestamp.getTime() - prev.timestamp.getTime()) / 1000;

      if (timeDiff > 0) {
        speed = (distance / timeDiff) * 3.6;
      }
    }

    return {
      latitude: p.latitude,
      longitude: p.longitude,
      timestamp: p.timestamp,
      ignition: p.ignition,
      speed: Number(speed.toFixed(2)),
    };
  });
};