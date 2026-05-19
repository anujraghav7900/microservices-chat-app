import { FaEye, FaEyeSlash } from "react-icons/fa";

import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import API from "../api/axios";


function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");


    // LOGIN FUNCTION
    const handleLogin = async () => {

        try {

            setLoading(true);

            setError("");

            const { data } = await API.post(
                "/auth/login",
                {
                    email,
                    password
                }
            );

            // STORE TOKEN
            localStorage.setItem(
                "token",
                data.token
            );

            // STORE USER
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            // STORE USERNAME
            localStorage.setItem(
                "userName",
                data.user.name
            );

            // REDIRECT
            navigate("/chat");

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Login Failed"
            );

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="login-page">

            {/* BACKGROUND CIRCLES */}

            <div className="bg-circle one"></div>
            <div className="bg-circle two"></div>
            <div className="bg-circle three"></div>


            {/* LEFT SIDE */}

            <div className="login-left">

                <div className="brand-container">


                    {/* LOGO */}

                    <div className="logo">

                        <div className="pulse-wave">

                            <svg
                                viewBox="0 0 200 60"
                                xmlns="http://www.w3.org/2000/svg"
                            >

                                <defs>

                                    <linearGradient
                                        id="gradient"
                                        x1="0%"
                                        y1="0%"
                                        x2="100%"
                                        y2="0%"
                                    >

                                        <stop
                                            offset="0%"
                                            stopColor="#A855F7"
                                        />

                                        <stop
                                            offset="100%"
                                            stopColor="#EC4899"
                                        />

                                    </linearGradient>

                                </defs>

                                <path
                                    d="
                                    M0 30
                                    L35 30
                                    L50 10
                                    L70 50
                                    L90 15
                                    L110 30
                                    L200 30
                                    "
                                />

                            </svg>

                        </div>

                        <h1>Pulse</h1>

                    </div>


                    {/* TAGLINE */}

                    <p>
                        Instant Connections,
                        Endless Conversations
                    </p>


                    {/* HERO BADGES */}

                    <div className="hero-badges">

                        <span>Real-Time Messaging</span>

                        <span>Group Chats</span>

                        <span>Live Connections</span>

                    </div>

                </div>

            </div>



            {/* RIGHT SIDE */}

            <div className="login-right">

                <div className="login-card">

                    <h2>Welcome Back</h2>

                    <p className="sub-text">
                        Login to continue your conversations
                    </p>


                    {/* ERROR BOX */}

                    {
                        error && (
                            <div className="error-box">
                                {error}
                            </div>
                        )
                    }


                    {/* EMAIL */}

                    <input
                        type="email"

                        placeholder="Email Address"

                        value={email}

                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                    />


                    {/* PASSWORD */}

                    <div className="password-box">

                        <input
                            type={
                                showPassword
                                ?
                                "text"
                                :
                                "password"
                            }

                            placeholder="Password"

                            value={password}

                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                        />

                        <span
                            className="eye-icon"

                            onClick={() =>
                                setShowPassword(!showPassword)
                            }
                        >

                            {
                                showPassword
                                ?
                                <FaEyeSlash />
                                :
                                <FaEye />
                            }

                        </span>

                    </div>


                    {/* LOGIN BUTTON */}

                    <button
                        onClick={handleLogin}
                    >

                        {
                            loading
                            ?
                            "Logging in..."
                            :
                            "Login"
                        }

                    </button>


                    {/* FOOTER */}

                    <span>

                        Don’t have an account?

                        <Link to="/register">
                            Register
                        </Link>

                    </span>

                </div>

            </div>

        </div>
    );
}

export default Login;