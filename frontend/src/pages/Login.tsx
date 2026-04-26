import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

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
            setErrorMsg("Invalid email or password");
            console.error("Login Error", error);
        }
    };




    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            navigate("/dashboard", { replace: true });
        }
    }, [navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-linear-to-r from-green-300 to-blue-300">
            <div className="w-80 rounded bg-white p-6 shadow">
                <h2 className="mb-4 text-center text-xl">Login</h2>

                <div className="mb-4">
                    {errorMsg && (
                        <div className="mb-3 text-sm text-red-500 bg-red-50 p-2 rounded">
                            {errorMsg}
                        </div>
                    )}
                    <div className="mb-1 text-sm text-gray-600">Email</div>
                    <input
                        type="email"
                        placeholder="Example@email.com"
                        className="w-full border p-2"
                        
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setErrorMsg("");
                        }}
                      

                    />

                </div>

                <div className="mb-6">
                    <div className="mb-1 text-sm text-gray-600">Password</div>
                    <input
                        type="password"
                        placeholder="At least 8 characters"
                        className="w-full border p-2"
                        required
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setErrorMsg("");
                        }}
                       
                    />
                </div>

                <button
                    onClick={handleLogin}
                    className="w-full bg-black px-4 py-2 text-white"
                >
                    Sign in
                </button>

                <p className="mt-4 text-center text-sm">
                    Don’t have an account?{" "}
                    <span
                        className="text-blue-600 cursor-pointer"
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