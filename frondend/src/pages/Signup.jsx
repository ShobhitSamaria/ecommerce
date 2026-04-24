import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // For success message
  const [loading, setLoading] = useState(false); // To disable button while calling API

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

      setLoading(true); // Start loading

      try {
          // Wait for the signup process to finish
          const result = await signup(formData.name, formData.email, formData.password);

          if (result.success) {
                  navigate("/login", { state: { accountCreated: true } });
          }
      } catch (err) {
          setError(err);
      } finally {
          setLoading(false); // Stop loading regardless of success or fail
      }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-lg border">

         <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                        <div className="icon-user-plus text-orange-600 w-6 h-6"></div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Create Account</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join ShopHub today
                    </p>
                </div>

        <form className="space-y-4" onSubmit={handleSubmit}>

          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded">
              {error}
            </div>
          )}
      <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                className="input-field"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="input-field"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="input-field"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="input-field"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

          <button
            type="submit"
            className="w-full py-2 bg-orange-500 text-white rounded-md"
          >
            Create Account
          </button>

          <div className="text-center text-sm">
            <span>Already have an account? </span>
            <Link
              to="/login"
              className="text-orange-600 font-medium"
            >
              Sign in
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}

export default Signup;
