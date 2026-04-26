import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

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

    return (
        <div className="flex min-h-screen items-center justify-center bg-linear-to-r from-blue-300 to-green-300">
            <div className="w-80 rounded bg-white p-6 shadow">

                <h2 className="mb-4 text-center text-xl">Signup</h2>

                {errorMsg && (
                    <div className="mb-3 text-sm text-red-500 bg-red-50 p-2 rounded">
                        {errorMsg}
                    </div>
                )}

                {/* NAME */}
                <div className="mb-4">
                    <div className="mb-1 text-sm text-gray-600">Name</div>
                    <input
                        type="text"
                        placeholder="Your name"
                        className="w-full border p-2"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setErrorMsg("");
                        }}
                    />
                </div>

                {/* EMAIL */}
                <div className="mb-4">
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

                {/* PASSWORD */}
                <div className="mb-6">
                    <div className="mb-1 text-sm text-gray-600">Password</div>
                    <input
                        type="password"
                        placeholder="At least 8 characters"
                        className="w-full border p-2"
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
                    className="w-full bg-black px-4 py-2 text-white"
                >
                    Sign up
                </button>

                {/* LOGIN LINK */}
                <p className="mt-4 text-center text-sm">
                    Already have an account?{" "}
                    <span
                        className="text-blue-600 cursor-pointer"
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