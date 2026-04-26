import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import API from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import L from "leaflet";

type PathPoint = {
    latitude: number;
    longitude: number;
    timestamp: string;
    ignition: string;
    speed: number;
};

type IdleGroup = {
    latitude: number;
    longitude: number;
    duration: number;
};

type TableRow = {
    latitude: number;
    longitude: number;
    ignition: string;
    speed: number;
    fromTime: string;
    toTime: string;
};

type OverspeedSegment = {
    start: { latitude: number; longitude: number };
    end: { latitude: number; longitude: number };
};

type TripMeta = {
    name: string;
    distance: number;
    travelDuration: number;
    stoppageTime: number;
    idlingTime: number;
    overspeedDistance: number;
    overspeedDuration: number;
    overspeedSegments: OverspeedSegment[];
};

type Segment = {
    name: string;
    path: {
        latitude: number;
        longitude: number;
        timestamp: string | Date;
        ignition: string;
        speed: number;
    }[];
};



const getIdleGroups = (path: PathPoint[]): IdleGroup[] => {
    const groups: IdleGroup[] = [];
    let startIndex = -1;

    for (let i = 0; i < path.length; i++) {
        const p = path[i];
        console.log(p.speed, p.ignition);
        const isIdle =
            Number(p.speed) <= 5 &&
            p.ignition?.toString().toLowerCase() === "on";

        if (isIdle && startIndex === -1) {
            startIndex = i;
        }

        if ((!isIdle || i === path.length - 1) && startIndex !== -1) {
            const endIndex = isIdle ? i : i - 1;
            const start = path[startIndex];
            const end = path[endIndex];

            const durationSeconds =
                (new Date(end.timestamp).getTime() -
                    new Date(start.timestamp).getTime()) /
                1000;

            if (durationSeconds > 3) {
                const midIndex = Math.floor((startIndex + endIndex) / 2);
                const mid = path[midIndex];

                groups.push({
                    latitude: mid.latitude,
                    longitude: mid.longitude,
                    duration: Number((durationSeconds / 60).toFixed(1)),
                });
            }
            startIndex = -1;
        }
    }
    return groups;
};

type StoppedGroup = {
    latitude: number;
    longitude: number;
    duration: number;
};

const getStoppedGroups = (path: PathPoint[]): StoppedGroup[] => {
    const groups: StoppedGroup[] = [];
    let startIndex = -1;

    for (let i = 0; i < path.length; i++) {
        const p = path[i];
        const isStopped = p.ignition?.toString().toLowerCase() === "off";

        if (isStopped && startIndex === -1) {
            startIndex = i;
        }

        if ((!isStopped || i === path.length - 1) && startIndex !== -1) {
            const endIndex = isStopped ? i : i - 1;
            const start = path[startIndex];
            const end = path[endIndex];

            const durationSeconds =
                (new Date(end.timestamp).getTime() -
                    new Date(start.timestamp).getTime()) /
                1000;

            if (durationSeconds > 5) {
                const midIndex = Math.floor((startIndex + endIndex) / 2);
                const mid = path[midIndex];

                groups.push({
                    latitude: mid.latitude,
                    longitude: mid.longitude,
                    duration: Number((durationSeconds / 60).toFixed(1)),
                });
            }
            startIndex = -1;
        }
    }
    return groups;
};




const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    const remaining = mins % 60;

    if (hrs > 0) return `${hrs} Hr ${remaining} Mins`;
    return `${remaining} Mins`;
};


type FitBoundsProps = {
    points: {
        latitude: number;
        longitude: number;
    }[];
};

function FitBounds({ points }: FitBoundsProps) {
    const map = useMap();

    useEffect(() => {
        if (!points || points.length === 0) return;

        const bounds = points.map(
            (p): [number, number] => [p.latitude, p.longitude]
        );

        map.fitBounds(bounds);
    }, [points, map]);

    return null;
}


const MapView = () => {
    const [fullPath, setFullPath] = useState<PathPoint[]>([]);
    const mapRef = useRef<L.Map | null>(null);
    const { id } = useParams();
    const idleGroups = getIdleGroups(fullPath);
    const stoppedGroups = getStoppedGroups(fullPath);
    const [tripMeta, setTripMeta] = useState<TripMeta | null>(null);

    const [segments, setSegments] = useState<Segment[]>([]);
    const [activeSegment, setActiveSegment] = useState<Segment | null>(null);

    console.log("activeSegment", activeSegment);
    const [rows, setRows] = useState<TableRow[]>([]);

    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    const navigate = useNavigate();


    const pathToUse = activeSegment?.path || fullPath;


    const segmentRows = pathToUse
        .map((curr, index) => {
            const prev = pathToUse[index - 1];
            if (!prev) return null;

            return {
                latitude: curr.latitude,
                longitude: curr.longitude,
                ignition: curr.ignition,
                speed: curr.speed,
                fromTime: prev.timestamp,
                toTime: curr.timestamp,
            };
        })
        .filter((row): row is NonNullable<typeof row> => row !== null);

    const rowsToShow = activeSegment ? segmentRows : rows;

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await API.get(`/trips/${id}?page=${page}&limit=10`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFullPath(res.data.fullPath);
                setTripMeta(res.data.tripMeta);
                setRows(res.data.data);
                setTotal(res.data.total);
                setSegments(res.data.segments);
            } catch (error) {
                console.error(error);
            }
        };
        if (id) fetchTrip();
    }, [id, page]);

    const totalPages = Math.ceil(total / limit);

    useEffect(() => {
        if (fullPath.length > 0 && mapRef.current) {
            const bounds = fullPath.map(
                (p): [number, number] => [p.latitude, p.longitude]
            );
            mapRef.current.fitBounds(bounds);
        }
    }, [fullPath]);

    const startIcon = new L.Icon({
        iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
        iconSize: [32, 32],
    });

    const endIcon = new L.Icon({
        iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
        iconSize: [32, 32],
    });


    const formatPoint = (lat: number, lng: number) => {
        const latDir = lat >= 0 ? "N" : "S";
        const lngDir = lng >= 0 ? "E" : "W";

        return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
    };



    const tabRef = useRef<HTMLDivElement | null>(null);

    const scrollLeft = () => {
        tabRef.current?.scrollBy({ left: -150, behavior: "smooth" });
    };

    const scrollRight = () => {
        tabRef.current?.scrollBy({ left: 150, behavior: "smooth" });
    };




    const segmentDuration = (() => {
        if (pathToUse.length < 2) return 0;

        const start = new Date(pathToUse[0].timestamp).getTime();
        const end = new Date(
            pathToUse[pathToUse.length - 1].timestamp
        ).getTime();

        return (end - start) / 1000; // seconds
    })();


    const segmentDistance = (() => {
        let dist = 0;

        for (let i = 1; i < pathToUse.length; i++) {
            const prev = pathToUse[i - 1];
            const curr = pathToUse[i];

            const dx = curr.latitude - prev.latitude;
            const dy = curr.longitude - prev.longitude;

            dist += Math.sqrt(dx * dx + dy * dy);
        }

        return dist * 111; // rough km conversion
    })();
    return (


        <div className="h-screen w-full bg-gray-100 flex flex-col p-4">

            <div className="bg-white border-b px-6 py-3 flex items-center">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border-2 border-gray-800 rounded-full flex items-center justify-center text-xs font-bold">
                        S
                    </div>
                    <span className="text-sm font-semibold text-gray-800">
                        Speedo
                    </span>
                </div>
            </div>
            {/* ================= HEADER (SEPARATE - LIKE FIGMA) ================= */}
            <div className="p-4 flex-1 overflow-auto">
                <div className="mb-4">

                    {/* Back Arrow (separate line) */}
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-600 text-xl mb-2"
                    >
                        ←
                    </button>

                    {/* Main Header Box */}
                    <div className="flex items-center justify-between border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">

                        <h2 className="text-sm font-medium text-gray-800">
                            {tripMeta?.name || "Trip Name"}
                            {activeSegment && (
                                <span className="text-gray-500 font-normal">
                                    {" / "}{activeSegment.name}
                                </span>
                            )}
                        </h2>
                        {/* RIGHT */}
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="bg-gray-800 text-white px-4 py-1.5 rounded-md text-sm"
                        >
                            New
                        </button>

                    </div>

                </div>

                {/* ================= MAP CARD ================= */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-4">

                    {/* Legend */}
                    <div className="flex items-center gap-6 text-sm mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                            <span className="text-gray-700">Stopped</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                            <span className="text-gray-700">Idle</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                            <span className="text-gray-700">Over speeding</span>
                        </div>
                    </div>

                    {/* Map */}
                    <div className="h-87.5 rounded-lg overflow-hidden border border-gray-200">
                        <MapContainer
                            key={activeSegment?.name || "full"}
                            center={[10.8505, 76.2711]}
                            zoom={7}
                            className="h-full w-full"
                            ref={mapRef}
                        >
                            <TileLayer
                                attribution="&copy; OpenStreetMap"
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {/* Path selector */}
                            <FitBounds points={activeSegment?.path || fullPath} />

                            {(activeSegment?.path || fullPath).length > 0 && (
                                <Polyline
                                    key={activeSegment?.name || "full"}
                                    positions={(activeSegment?.path || fullPath).map(
                                        (p): [number, number] => [p.latitude, p.longitude]
                                    )}
                                    pathOptions={{
                                        color: "#3B82F6",
                                        weight: 4,
                                        opacity: 0.8,
                                    }}
                                />
                            )}

                            {/* Start Marker */}
                            {pathToUse.length > 0 && (
                                <Marker
                                    position={[
                                        pathToUse[0].latitude,
                                        pathToUse[0].longitude,
                                    ]}
                                    icon={startIcon}
                                />
                            )}

                            {/* End Marker */}
                            {pathToUse.length > 0 && (
                                <Marker
                                    position={[
                                        pathToUse[pathToUse.length - 1].latitude,
                                        pathToUse[pathToUse.length - 1].longitude,
                                    ]}
                                    icon={endIcon}
                                />
                            )}

                            {/* 🔥 IDLE (filtered) */}
                            {idleGroups
                                .filter((g) =>
                                    pathToUse.some(
                                        (p) =>
                                            p.latitude === g.latitude &&
                                            p.longitude === g.longitude
                                    )
                                )
                                .map((g, index) => (
                                    <CircleMarker
                                        key={index}
                                        center={[g.latitude, g.longitude]}
                                        radius={8}
                                        pathOptions={{
                                            color: "#EC4899",
                                            fillColor: "#EC4899",
                                            fillOpacity: 0.8,
                                            weight: 2,
                                        }}
                                    >
                                        <Tooltip permanent direction="top" offset={[0, -10]}>
                                            Idle for {g.duration} mins
                                        </Tooltip>
                                    </CircleMarker>
                                ))}

                            {/* 🔥 STOPPED (filtered) */}
                            {stoppedGroups
                                .filter((g) =>
                                    pathToUse.some(
                                        (p) =>
                                            p.latitude === g.latitude &&
                                            p.longitude === g.longitude
                                    )
                                )
                                .map((g, index) => (
                                    <CircleMarker
                                        key={index}
                                        center={[g.latitude, g.longitude]}
                                        radius={8}
                                        pathOptions={{
                                            color: "#2563EB",
                                            fillColor: "#2563EB",
                                            fillOpacity: 0.8,
                                            weight: 2,
                                        }}
                                    >
                                        <Tooltip permanent direction="top" offset={[0, -10]}>
                                            Stopped for {g.duration} mins
                                        </Tooltip>
                                    </CircleMarker>
                                ))}

                            {/* 🔥 OVERSPEED (filtered) */}
                            {tripMeta?.overspeedSegments
                                .filter((seg) =>
                                    pathToUse.some(
                                        (p) =>
                                            p.latitude === seg.start.latitude &&
                                            p.longitude === seg.start.longitude
                                    )
                                )
                                .map((seg, index) => (
                                    <Polyline
                                        key={index}
                                        positions={[
                                            [seg.start.latitude, seg.start.longitude],
                                            [seg.end.latitude, seg.end.longitude],
                                        ]}
                                        pathOptions={{
                                            color: "#06B6D4",
                                            weight: 6,
                                            opacity: 0.9,
                                        }}
                                    />
                                ))}
                        </MapContainer>
                    </div>
                    <div className="mt-3 flex items-center gap-2">

                        {/* LEFT ARROW */}
                        <button
                            onClick={scrollLeft}
                            className="px-2 text-gray-400 hover:text-gray-700 transition"
                        >
                            ◀
                        </button>

                        {/* SCROLLABLE TABS */}
                        <div
                            ref={tabRef}
                            className="flex gap-6 overflow-x-auto scrollbar-hide flex-1 px-1"
                        >
                            {segments.map((seg, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveSegment(seg)}
                                    className={`pb-2 text-sm whitespace-nowrap transition-all ${activeSegment?.name === seg.name
                                        ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                                        : "text-gray-400 hover:text-gray-700"
                                        }`}
                                >
                                    {seg.name}
                                </button>
                            ))}
                        </div>

                        {/* RIGHT ARROW */}
                        <button
                            onClick={scrollRight}
                            className="px-2 text-gray-400 hover:text-gray-700 transition"
                        >
                            ▶
                        </button>

                    </div>
                </div>

                {/* Stats Cards */}
                <div className="px-4 pb-4">
                    <div className="grid grid-cols-5 gap-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">{((tripMeta?.distance ?? 0) / 1000).toFixed(2)} <span className="text-sm font-normal text-gray-500">KM</span></p>
                            <p className="text-xs text-gray-500 mt-1">Total Distance Travelled</p>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">{((tripMeta?.travelDuration ?? 0) / 60).toFixed(1)} <span className="text-sm font-normal text-gray-500">mins</span></p>
                            <p className="text-xs text-gray-500 mt-1">Total Travelled Duration</p>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">{((tripMeta?.overspeedDuration ?? 0) / 60).toFixed(1)} <span className="text-sm font-normal text-gray-500">mins</span></p>
                            <p className="text-xs text-gray-500 mt-1">Over Speeding Duration</p>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">{((tripMeta?.overspeedDistance ?? 0) / 1000).toFixed(1)} <span className="text-sm font-normal text-gray-500">KM</span></p>
                            <p className="text-xs text-gray-500 mt-1">Over Speeding Distance</p>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">{((tripMeta?.stoppageTime ?? 0) / 60).toFixed(1)} <span className="text-sm font-normal text-gray-500">mins</span></p>
                            <p className="text-xs text-gray-500 mt-1">Stopped Duration</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Table and Summary */}
                <div className="flex-1 grid grid-cols-3 gap-4 px-1 mb-4">

                    {/* ================= TABLE ================= */}
                    <div className="col-span-2 bg-white rounded-xl border shadow-sm overflow-hidden">

                        {/* Header */}
                        <div className="px-4 py-3 border-b bg-gray-50">
                            <h3 className="text-sm font-semibold text-gray-800">
                                Trip Data
                            </h3>
                        </div>

                        {/* Table */}
                        <div className="overflow-auto max-h-100">
                            <table className="w-full text-sm">

                                <thead className="bg-gray-50 sticky top-0">
                                    <tr className="text-left text-gray-500 text-xs uppercase">
                                        <th className="px-4 py-3">Time</th>
                                        <th className="px-4 py-3">Point</th>
                                        <th className="px-4 py-3">Ignition</th>
                                        <th className="px-4 py-3">Speed</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">

                                    {rowsToShow.map((row, index) => (
                                        <tr key={index} className="hover:bg-gray-50">

                                            <td className="px-4 py-3 text-xs text-gray-700">
                                                {new Date(row.fromTime).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}{" "}
                                                -{" "}
                                                {new Date(row.toTime).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </td>

                                            <td className="px-4 py-3 text-xs text-gray-600">
                                                {formatPoint(row.latitude, row.longitude)}
                                            </td>

                                            <td className="px-4 py-3 text-xs font-semibold">
                                                <span
                                                    className={
                                                        row.ignition.toLowerCase() === "on"
                                                            ? "text-green-600"
                                                            : "text-red-500"
                                                    }
                                                >
                                                    {row.ignition.toUpperCase()}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 text-xs text-gray-700">
                                                {row.speed.toFixed(1)} km/h
                                            </td>

                                        </tr>
                                    ))}

                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ================= SUMMARY ================= */}
                    <div className="bg-white rounded-xl border shadow-sm p-4">

                        <h3 className="text-sm font-semibold text-gray-800 mb-3">
                            Summary
                        </h3>

                        <div className="space-y-3 text-sm">

                            {/* Travel Duration */}
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Travel Duration</span>
                                <span className="font-medium">
                                    {formatDuration(
                                        activeSegment
                                            ? segmentDuration
                                            : tripMeta?.travelDuration ?? 0
                                    )}
                                </span>
                            </div>

                            {/* Stopped Duration (keep backend for now) */}
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Stopped Duration</span>
                                <span className="font-medium">
                                    {formatDuration(tripMeta?.stoppageTime ?? 0)}
                                </span>
                            </div>

                            {/* Distance */}
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Distance</span>
                                <span className="font-medium">
                                    {activeSegment
                                        ? `${segmentDistance.toFixed(1)} km`
                                        : `${((tripMeta?.distance ?? 0) / 1000).toFixed(1)} km`}
                                </span>
                            </div>

                            {/* Overspeed Duration (keep backend for now) */}
                            <div className="flex justify-between">
                                <span className="text-gray-500">Overspeed Duration</span>
                                <span className="font-medium">
                                    {formatDuration(tripMeta?.overspeedDuration ?? 0)}
                                </span>
                            </div>

                        </div>
                    </div>

                </div>

                {/* Pagination */}
                <div className="px-4 pb-6">
                    <div className="flex justify-center items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'}`}
                        >
                            Previous
                        </button>
                        <div className="flex gap-1">
                            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                let pageNum = i + 1;
                                if (totalPages > 7) {
                                    if (page <= 4) pageNum = i + 1;
                                    else if (page >= totalPages - 3) pageNum = totalPages - 6 + i;
                                    else pageNum = page - 3 + i;
                                }
                                if (pageNum > totalPages || pageNum < 1) return null;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${page === pageNum ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'}`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapView;