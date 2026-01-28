import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";
import { UserDataContext } from "../context/userContext";

const Signup = () => {
  const navigate = useNavigate();
  const { serverUrl } = useContext(authDataContext);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {userData,setUserData}= useContext(UserDataContext)
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        serverUrl + "/api/auth/signup",
        { firstname, lastname, username, email, password },
        { withCredentials: true }
      );

      console.log("Signup success:", res.data);

      // Reset form
      setFirstname("");
      setLastname("");
      setUsername("");
      setEmail("");
      setPassword("");
setUserData(res.data)
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Signup failed");
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
        <h2 className="text-xl font-semibold mb-4 text-center">Sign Up</h2>

        <form onSubmit={handleSignup}>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Firstname"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />

            <input
              type="text"
              placeholder="Lastname"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />

            {/* Password */}
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
            className="w-full bg-[#0a66c2] text-white py-2 rounded-full mt-5 font-semibold hover:bg-[#004182]"
          >
            Sign Up
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <span
            className="text-[#0a66c2] font-semibold cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
