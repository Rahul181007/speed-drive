import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import logo from "../assets/logo.jpeg";
type Trip = {
    _id: string;
    name: string;
    distance: number;
    stoppageTime: number;
    idlingTime: number;
    path: { latitude: number; longitude: number }[];
    overspeedSegments: {
        start: { latitude: number; longitude: number };
        end: { latitude: number; longitude: number };
    }[];
    createdAt: string;
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [tripName, setTripName] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [trips, setTrips] = useState<Trip[]>([]);


    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await API.get("/trips", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setTrips(res.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchTrips();
    }, []);
    const handleUpload = async () => {
        if (!file || !tripName) {
            alert("Please provide trip name and file");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("name", tripName);

            const token = localStorage.getItem("token");

            await API.post("/upload", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            alert("Trip uploaded successfully");

            setShowModal(false);
            setTripName("");
            setFile(null);

        } catch (error) {
            console.error(error);
            alert("Upload failed");
        }
    };
    return (
        <div className="min-h-screen bg-gray-100">

            {/* Header */}
            <div className="flex items-center justify-between bg-white px-6 py-3 shadow">
                        <div className="flex items-end gap-1">
            <img src={logo} alt="logo" className="h-8 w-auto" />
            <span className="text-sm font-semibold text-gray-900 mb-1">
                Speedo
            </span>
        </div>

                <button
                    onClick={() => {
                        localStorage.removeItem("token");
                        navigate("/",{ replace: true });
                    }}
                    className="text-sm text-red-500"
                >
                    Logout
                </button>
            </div>

            {/* Content */}
            <div className="p-6">

                {/* Welcome Box */}
                <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
                    <p className="text-gray-700">👋 Welcome, User</p>
                </div>

                {/* Upload Card */}
                <div className="flex items-center justify-center">
                    <div className="w-full max-w-xl rounded-lg border bg-white p-8 text-center shadow">

                        <img
                            src="https://cdn-icons-png.flaticon.com/512/2921/2921822.png"
                            alt="upload"
                            className="mx-auto mb-4 w-20"
                        />

                        <button
                            onClick={() => setShowModal(true)}
                            className="rounded bg-black px-6 py-2 text-white hover:bg-gray-800"
                        >
                            Upload Trip
                        </button>

                        <p className="mt-2 text-sm text-gray-400">
                            Upload the Excel sheet of your trip
                        </p>

                    </div>
                </div>

                <div className="mt-6 rounded bg-white p-4 shadow">
                    <h2 className="mb-3 text-lg font-semibold">Trips</h2>

                    {trips.length === 0 ? (
                        <p className="text-gray-400">No trips uploaded</p>
                    ) : (
                        <ul>
                            {trips.map((trip) => (
                                <li
                                    key={trip._id}
                                    className="flex items-center justify-between border-b py-2"
                                >
                                    <span>{trip.name}</span>

                                        <button
      onClick={() => navigate(`/map/${trip._id}`)}
      className="text-blue-500"
    >
      View
    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40">

                    <div className="w-100 rounded-lg bg-white p-6 shadow-lg">

                        {/* Close */}
                        <div className="flex justify-end">
                            <button onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        {/* Input */}
                        <input
                            type="text"
                            placeholder="Trip Name"
                            className="mb-4 w-full rounded border p-2"
                            value={tripName}
                            onChange={(e) => setTripName(e.target.value)}
                        />

                        {/* File Upload */}
                        <label className="mb-4 flex cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed p-6 text-gray-500 hover:bg-gray-50">
                            Click here to upload CSV file
                            <input
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                        </label>

                        {/* Buttons */}
                        <div className="flex justify-between">
                            <button
                                onClick={() => setShowModal(false)}
                                className="rounded border px-4 py-2"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleUpload}
                                className="rounded bg-black px-4 py-2 text-white"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>


    );
};

export default Dashboard;