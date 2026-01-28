import User from "../models/user.model.js";
import Connection from "../models/connection.model.js";
import { io, userSocketMap } from "../index.js";

// ------------------ SEND CONNECTION ------------------
export const sendConnection = async (req, res) => {
  try {
    const { userId } = req.params;
    const sender = req.userId;

    if (sender.toString() === userId.toString())
      return res.status(400).json({ message: "You can't connect with yourself" });

    const user = await User.findById(sender);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.connections?.includes(userId))
      return res.status(400).json({ message: "Already connected" });

    const existing = await Connection.findOne({
      sender,
      receiver: userId,
      status: "pending",
    });
    if (existing)
      return res.status(400).json({ message: "Request already sent" });

    const reverse = await Connection.findOne({
      sender: userId,
      receiver: sender,
      status: "pending",
    });
    if (reverse)
      return res.status(400).json({ message: "User already sent you request" });

    const connection = await Connection.create({ sender, receiver: userId });

    const receiverSocket = userSocketMap.get(userId);
    const senderSocket = userSocketMap.get(sender);

    receiverSocket &&
      io.to(receiverSocket).emit("connectionUpdate", {
        updatedUserId: sender,
        status: "received",
      });

    senderSocket &&
      io.to(senderSocket).emit("connectionUpdate", {
        updatedUserId: userId,
        status: "sent",
      });

    return res.status(201).json({
      message: "Connection request sent",
      connection,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Send connection error" });
  }
};

// ------------------ ACCEPT CONNECTION ------------------
export const acceptConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.userId;

    const connection = await Connection.findById(connectionId);
    if (!connection)
      return res.status(404).json({ message: "Connection does not exist" });

    if (connection.receiver.toString() !== userId.toString())
      return res.status(403).json({ message: "Not authorized" });

    if (connection.status !== "pending")
      return res.status(400).json({ message: "Already processed" });

    connection.status = "accepted";
    await connection.save();

    await User.findByIdAndUpdate(connection.sender, {
      $addToSet: { connections: connection.receiver },
    });
    await User.findByIdAndUpdate(connection.receiver, {
      $addToSet: { connections: connection.sender },
    });

    const senderSocket = userSocketMap.get(connection.sender.toString());
    const receiverSocket = userSocketMap.get(connection.receiver.toString());

    senderSocket &&
      io.to(senderSocket).emit("connectionUpdate", {
        updatedUserId: connection.receiver,
        status: "accepted",
      });

    receiverSocket &&
      io.to(receiverSocket).emit("connectionUpdate", {
        updatedUserId: connection.sender,
        status: "accepted",
      });

    return res.status(200).json({ message: "Connection accepted", connection });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Accept connection error" });
  }
};

// ------------------ REJECT CONNECTION ------------------
export const rejectConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.userId;

    const connection = await Connection.findById(connectionId);
    if (!connection)
      return res.status(404).json({ message: "Connection does not exist" });

    if (connection.receiver.toString() !== userId.toString())
      return res.status(403).json({ message: "Not authorized" });

    connection.status = "rejected";
    await connection.save();

    return res.status(200).json({ message: "Connection rejected", connection });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Reject connection error" });
  }
};

// ------------------ REMOVE CONNECTION ------------------
export const removeConnection = async (req, res) => {
  try {
    const loggedInUser = req.userId;
    const { userId } = req.params;

    const connection = await Connection.findOne({
      $or: [
        { sender: loggedInUser, receiver: userId },
        { sender: userId, receiver: loggedInUser },
      ],
    });

    if (!connection)
      return res.status(404).json({ message: "Connection not found" });

    await User.findByIdAndUpdate(loggedInUser, {
      $pull: { connections: userId },
    });
    await User.findByIdAndUpdate(userId, {
      $pull: { connections: loggedInUser },
    });

    await Connection.findByIdAndDelete(connection._id);

    return res.status(200).json({ message: "Connection removed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Remove connection error" });
  }
};

// ------------------ GET CONNECTION STATUS ------------------
export const getConnectionStatus = async (req, res) => {
  try {
    const loggedInUser = req.userId;
    const { userId } = req.params;

    const connection = await Connection.findOne({
      $or: [
        { sender: loggedInUser, receiver: userId },
        { sender: userId, receiver: loggedInUser },
      ],
    });

    if (!connection) {
      return res.status(200).json({ status: "none" });
    }

    return res.status(200).json({
      status: connection.status,
      sender: connection.sender,
      receiver: connection.receiver,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Get status error" });
  }
};

// ------------------ GET CONNECTION REQUESTS ------------------
export const getConnectionRequests = async (req, res) => {
  try {
    const userId = req.userId;

    const requests = await Connection.find({
      receiver: userId,
      status: "pending",
    }).populate(
      "sender",
      "firstname lastname username email profileImage headline"
    );

    return res.status(200).json({
      count: requests.length,
      requests,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ------------------ GET USER CONNECTIONS ------------------
export const getUserConnections = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate(
      "connections",
      "firstname lastname username profileImage headline"
    );

    return res.status(200).json({
      count: user.connections.length,
      connections: user.connections,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Get connections error" });
  }
};
