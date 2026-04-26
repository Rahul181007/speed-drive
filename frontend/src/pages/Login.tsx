import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import logo from "../assets/Speed drive.jpeg";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!email || !password) {
            setErrorMsg("Email and password are required");
            return;
        }

        try {
            const res = await API.post("/auth/login", { email, password });
            localStorage.setItem("token", res.data.token);
            setErrorMsg("");
            navigate("/dashboard", { replace: true });
        } catch (error) {
            console.error(error);
            setErrorMsg("Invalid email or password");
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) navigate("/dashboard", { replace: true });
    }, [navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-green-300 to-blue-300">

            <div className="w-96 rounded-2xl bg-white p-8 shadow-lg">

                <div className="flex justify-center items-end gap-1 mb-3">
                    <img src={logo} alt="logo" className="h-12 w-auto" />
                    <span className="text-sm font-semibold text-gray-900">
                        Speedo
                    </span>
                </div>

                {/* Title */}
                <h2 className="mb-6 text-center text-xl font-semibold text-gray-800">
                    Welcome Back
                </h2>

                {/* Error */}
                {errorMsg && (
                    <div className="mb-4 text-sm text-red-500 bg-red-50 p-2 rounded">
                        {errorMsg}
                    </div>
                )}

                {/* Email */}
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

                {/* Password */}
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

                {/* Button */}
                <button
                    onClick={handleLogin}
                    className="w-full bg-black hover:bg-gray-800 transition text-white py-2 rounded-md"
                >
                    Sign In
                </button>

                {/* Signup */}
                <p className="mt-4 text-center text-sm">
                    Don’t have an account?{" "}
                    <span
                        className="text-blue-600 cursor-pointer hover:underline"
                        onClick={() => navigate("/signup")}
                    >
                        Sign up
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;