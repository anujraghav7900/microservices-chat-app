import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { FaEye, FaEyeSlash } from "react-icons/fa";

import API from "../api/axios";


function Register() {

    const navigate = useNavigate();

    const [name, setName] = useState("");

    const [userId, setUserId] = useState("");

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");


    // REGISTER FUNCTION

    const handleRegister = async () => {

        try {

            setLoading(true);

            setError("");

            await API.post(
                "/auth/register",
                {
                    name,
                    userId,
                    email,
                    password
                }
            );

            navigate("/");

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Registration Failed"
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



            {/* LEFT */}

            <div className="login-left">

                <div className="brand-container">

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

                    <p>
                        Create your identity.
                        Start real-time conversations.
                    </p>

                    <div className="hero-badges">

                        <span>Secure Messaging</span>

                        <span>Live Chats</span>

                        <span>Instant Connections</span>

                    </div>

                </div>

            </div>



            {/* RIGHT */}

            <div className="login-right">

                <div className="login-card">

                    <h2>Create Account</h2>

                    <p className="sub-text">
                        Join Pulse and connect instantly
                    </p>


                    {/* ERROR */}

                    {
                        error && (
                            <div className="error-box">
                                {error}
                            </div>
                        )
                    }


                    {/* NAME */}

                    <input
                        type="text"

                        placeholder="Full Name"

                        value={name}

                        onChange={(e) =>
                            setName(e.target.value)
                        }
                    />


                    {/* USER ID */}

                    <input
                        type="text"

                        placeholder="Choose User ID"

                        value={userId}

                        onChange={(e) =>
                            setUserId(e.target.value)
                        }
                    />


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


                    {/* BUTTON */}

                    <button
                        onClick={handleRegister}
                    >

                        {
                            loading
                            ?
                            "Creating..."
                            :
                            "Create Account"
                        }

                    </button>


                    {/* FOOTER */}

                    <span>

                        Already have an account?

                        <Link to="/">
                            Login
                        </Link>

                    </span>

                </div>

            </div>

        </div>
    );
}

export default Register;