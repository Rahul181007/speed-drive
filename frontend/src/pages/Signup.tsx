import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import logo from "../assets/logo.jpeg";
const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [errorMsg, setErrorMsg] = useState("");
    const navigate = useNavigate();

    const handleSignup = async () => {
        if (!name || !email || !password) {
            setErrorMsg("All fields are required");
            return;
        }
        try {
            await API.post("/auth/register", {
                name,
                email,
                password,
            });

            setErrorMsg("");
            navigate("/", { replace: true });
        }
        catch (error: unknown) {
            setErrorMsg("Something went wrong");
            console.error("Signup Error", error);
        }
    };

    useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
        navigate("/dashboard", { replace: true });
    }
}, [navigate]);

    return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-r from-blue-300 to-green-300">
        
        <div className="w-96 rounded-2xl bg-white p-8 shadow-lg">

            
            <div className="flex items-end justify-center gap-1 mb-4">
                <img src={logo} alt="logo" className="h-12 w-auto" />
                <span className="text-sm font-semibold text-gray-900 mb-1">
                    Speedo
                </span>
            </div>

            {/* TITLE (optional subtle) */}
            <h2 className="mb-4 text-center text-base text-gray-600">
                Create your account
            </h2>

            {/* ERROR */}
            {errorMsg && (
                <div className="mb-4 text-sm text-red-500 bg-red-50 p-2 rounded">
                    {errorMsg}
                </div>
            )}

            {/* NAME */}
            <div className="mb-4">
                <label className="text-sm text-gray-600">Name</label>
                <input
                    type="text"
                    placeholder="Your name"
                    className="w-full mt-1 border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        setErrorMsg("");
                    }}
                />
            </div>

            {/* EMAIL */}
            <div className="mb-4">
                <label className="text-sm text-gray-600">Email</label>
                <input
                    type="email"
                    placeholder="example@email.com"
                    className="w-full mt-1 border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMsg("");
                    }}
                />
            </div>

            {/* PASSWORD */}
            <div className="mb-6">
                <label className="text-sm text-gray-600">Password</label>
                <input
                    type="password"
                    placeholder="At least 6 characters"
                    className="w-full mt-1 border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMsg("");
                    }}
                />
            </div>

            {/* BUTTON */}
            <button
                onClick={handleSignup}
                className="w-full bg-black hover:bg-gray-800 transition text-white py-2 rounded-md"
            >
                Sign up
            </button>

            {/* LOGIN LINK */}
            <p className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <span
                    className="text-blue-600 cursor-pointer hover:underline"
                    onClick={() => navigate("/")}
                >
                    Login
                </span>
            </p>

        </div>
    </div>
);
};

export default Signup;