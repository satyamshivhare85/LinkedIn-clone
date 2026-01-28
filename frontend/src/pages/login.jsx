import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";
import { UserDataContext } from "../context/userContext";

const Login = () => {
  const navigate = useNavigate();
  const { serverUrl } = useContext(authDataContext);
const { userData, setUserData } = useContext(UserDataContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${serverUrl}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      console.log("Login success:", res.data);
      setEmail("");
      setPassword("");
      setUserData(res.data)
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f2ef] flex flex-col items-center">
      {/* Logo */}
      <div className="mt-8 mb-6 text-3xl font-bold text-[#0a66c2]">
        Linked
        <span className="bg-[#0a66c2] text-white px-1 rounded">in</span>
      </div>

      {/* Card */}
      <div className="bg-white w-[380px] p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Log in</h2>

        <form onSubmit={handleLogin}>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#0a66c2]"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-full mt-5 font-semibold text-white
              ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#0a66c2] hover:bg-[#004182]"}`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Want to create a new Account?{" "}
          <span
            className="text-[#0a66c2] font-semibold cursor-pointer hover:underline"
            onClick={() => navigate("/signup")}
          >
            SignUp
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
