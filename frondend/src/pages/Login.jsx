import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";

function Login() {
    const location = useLocation();
    const [infoMessage, setInfoMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        //  Check if state exists and accountCreated is true
        if (location.state && location.state.accountCreated) {
            setInfoMessage("Account created successfully! Please log in.");

            // Optional: Clear state so message disappears on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signin } = useAuth();
  const navigate = useNavigate();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      setInfoMessage("");
      setLoading(true);

      try {
          const result = await signin(email, password);

          if (result.success) {
              // Navigate to index/home page after success
              navigate("/", { replace: true });
          }
      } catch (err) {
          //  Display error from backend (e.g., "Error: Invalid email or password!")
          setError(err || "Something went wrong. Please try again.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border">

        <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                        <div className="icon-user text-orange-600 w-6 h-6"></div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Sign in to ShopHub</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Use any email and password to access dummy account
                    </p>
                </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Success Message Notification */}
            {infoMessage && (
                <div className="bg-green-50 text-green-600 text-sm p-3 rounded border border-green-200">
                    {infoMessage}
                </div>
            )}

            {/* Error Message Notification */}
            {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded border border-red-200">
                    {error}
                </div>
            )}

          <input
            type="email"
            required
            placeholder="Email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            required
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full py-2 bg-orange-500 text-white rounded-md"
          >
            Sign In
          </button>

          <div className="text-center text-sm mt-4">
            <span>Don't have an account? </span>
            <Link
              to="/signup"
              className="font-medium text-orange-600"
            >
              Sign up
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}

export default Login;
