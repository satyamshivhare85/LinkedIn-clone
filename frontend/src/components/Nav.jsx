import {
  Home,
  Users,
  Briefcase,
  MessageCircle,
  Bell,
  Search,
} from "lucide-react";
import { useState, useRef, useEffect, useContext } from "react";
import dp from "../assets/User.webp";
import { UserDataContext } from "../context/userContext";
import { authDataContext } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Network from "../pages/Network";
function Nav() {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const popupRef = useRef(null);
  const { userData, setUserData } = useContext(UserDataContext);
  const { serverUrl } = useContext(authDataContext);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value;
    console.log("Search:", query);
  };

  const handleSignOut = async () => {
    try {
      let res = await axios.get(serverUrl + "/api/auth/logout", { withCredentials: true });
      setUserData(null);
      navigate('/login');
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Close profile popup if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowProfilePopup(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="w-full bg-white shadow-sm border-b sticky top-0 z-50 ">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">

          {/* LEFT - Logo & Search */}
          <div className="flex items-center gap-3">
            <div className="text-blue-600 font-bold text-2xl cursor-pointer">in</div>

            {/* Desktop search */}
            <form
              onSubmit={handleSearch}
              className="relative hidden md:block cursor-pointer"
            >
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                name="search"
                placeholder="Search"
                className="pl-8 pr-3 py-1.5 w-64 rounded-md bg-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </form>
          </div>

          {/* CENTER - desktop nav icons */}
          <div className="hidden md:flex items-center gap-6 text-gray-600">
            <NavItem icon={<Home />} label="Home" to="/" />
            <NavItem icon={<Users />} label="My Network" to="/network" />
            <NavItem icon={<Briefcase />} label="Jobs" />
            <NavItem icon={<MessageCircle />} label="Messaging" />
            <NavItem icon={<Bell />} label="Notifications" />
          </div>

          {/* RIGHT - Mobile search & profile */}
          <div className="flex items-center gap-3 relative cursor-pointer">

            {/* Mobile search icon */}
            <button
              className="md:hidden"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
            >
              <Search className="h-5 w-5 text-gray-600 cursor-pointer" />
            </button>

            {/* Profile DP */}
            <img
              src={userData?.profileImage || dp}
              alt="profile"
              className="h-9 w-9 rounded-full cursor-pointer"
              onClick={() => setShowProfilePopup(!showProfilePopup)}
            />

            {/* Profile popup */}
            {showProfilePopup && userData && (
              <div
                ref={popupRef}
                className="absolute right-0 top-12 w-64 bg-white shadow-lg border rounded-md z-50"
              >
                {/* Profile info */}
                <div className="flex flex-col items-start gap-2 p-3 border-b">
                  <img
                    src={userData.profileImage || dp}
                    alt="profile"
                    className="h-10 w-10 rounded-full"
                  />
                  <p className="font-semibold text-sm">{userData.username}</p>
                  <p className="text-xs text-gray-500">{userData.firstname} {userData.lastname}</p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col p-2 gap-1">
                  <button className="text-sm px-3 py-2 border border-violet-700 text-violet-700 rounded-full hover:bg-violet-50 text-left cursor-pointer">
                    View Profile
                  </button>

                  {/* My Network Button - click navigate */}
                  <button
                    className="flex items-center gap-2 text-sm px-3 py-2 rounded hover:bg-gray-100 text-left cursor-pointer"
                    onClick={() => navigate("/network")}
                  >
                    <Users className="h-4 w-4" />
                    <span>My Network</span>
                  </button>

                  <button
                    className="text-sm px-3 py-2 border border-red-500 text-red-600 rounded-full hover:bg-red-50 text-left cursor-pointer"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile search bar */}
        {showMobileSearch && (
          <div className="md:hidden pt-2 pb-3">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                name="search"
                placeholder="Search"
                className="w-full px-3 py-2 rounded-md bg-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </form>
          </div>
        )}
      </div>
    </nav>
  );
}

// NavItem with optional 'to' prop for navigation
function NavItem({ icon, label, to }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => to && navigate(to)}
      className="flex flex-col items-center text-xs cursor-pointer hover:text-black"
    >
      <div className="h-5 w-5">{icon}</div>
      <span>{label}</span>
    </div>
  );
}

export default Nav;
