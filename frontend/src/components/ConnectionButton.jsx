import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { authDataContext } from "../context/AuthContext";
import { UserDataContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";

function ConnectionButton({ userId }) {
  const { serverUrl } = useContext(authDataContext);
  const { userData } = useContext(UserDataContext);
  const navigate = useNavigate();

  const [status, setStatus] = useState("none"); // none | sent | received | accepted
  const socketRef = useRef(null);

  /* ================= SOCKET CONNECT ================= */
  useEffect(() => {
    if (!userData?._id || !serverUrl) return;

    socketRef.current = io(serverUrl, { withCredentials: true });
    socketRef.current.emit("register", userData._id); // register current user

    // Listen for updates from server
    socketRef.current.on("connectionUpdate", ({ fromUserId, toUserId, newStatus }) => {
      // Agar ye update humare ya clicked user ke liye ho
      if (fromUserId === userId || toUserId === userData._id) {
        setStatus(newStatus);
      }
    });

    return () => socketRef.current.disconnect();
  }, [serverUrl, userData?._id, userId]);

  /* ================= GET STATUS ================= */
  useEffect(() => {
    if (!serverUrl) return;

    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/connection/status/${userId}`, {
          withCredentials: true,
        });

        const s = res.data.status;
        if (s === "pending") {
          setStatus(res.data.sender === userId ? "received" : "sent");
        } else if (s === "accepted") {
          setStatus("accepted");
        } else {
          setStatus("none");
        }
      } catch (err) {
        console.error("Status error:", err);
      }
    };

    fetchStatus();
  }, [serverUrl, userId]);

  /* ================= HANDLERS ================= */
  const sendRequest = async () => {
    try {
      // Immediately update UI
      setStatus("sent");

      await axios.post(`${serverUrl}/api/connection/send/${userId}`, {}, { withCredentials: true });

      // Notify other user via socket
      socketRef.current.emit("connectionUpdate", {
        fromUserId: userData._id,
        toUserId: userId,
        newStatus: "received",
      });
    } catch (err) {
      console.error(err);
      setStatus("none"); // revert if error
    }
  };

  const acceptRequest = async () => {
    try {
      await axios.put(`${serverUrl}/api/connection/accept/${userId}`, {}, { withCredentials: true });
      setStatus("accepted");

      // Notify sender that connection is accepted
      socketRef.current.emit("connectionUpdate", {
        fromUserId: userData._id,
        toUserId: userId,
        newStatus: "accepted",
      });

      navigate("/network");
    } catch (err) {
      console.error(err);
    }
  };

  const removeConnection = async () => {
    try {
      await axios.delete(`${serverUrl}/api/connection/remove/${userId}`, { withCredentials: true });
      setStatus("none");

      // Notify other user about disconnection
      socketRef.current.emit("connectionUpdate", {
        fromUserId: userData._id,
        toUserId: userId,
        newStatus: "none",
      });
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= UI ================= */
  if (!userData?._id || userData._id === userId) return null;

  if (status === "accepted")
    return (
      <button
        onClick={removeConnection}
        className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-600"
      >
        Connected
      </button>
    );
  if (status === "sent")
    return (
      <button disabled className="px-4 py-1.5 rounded-full border text-gray-500">
        Pending
      </button>
    );
  if (status === "received")
    return (
      <button
        onClick={acceptRequest}
        className="px-4 py-1.5 rounded-full bg-green-100 text-green-600"
      >
        Accept
      </button>
    );

  return (
    <button
      onClick={sendRequest}
      className="px-4 py-1.5 rounded-full border border-blue-600 text-blue-600"
    >
      Connect
    </button>
  );
}

export default ConnectionButton;
