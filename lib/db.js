import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

const connect = async () => {
  const connectionState = mongoose.connection.readyState;

  if (connectionState === 1) {
    console.log("Already connected");
    return;
  }

  if (connectionState === 2) {
    console.log("Connecting...");
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: "next14restapi",
      bufferCommands: true,
    });
    console.log("DB Connected 🚀");
  } catch (err) {
    console.log("Error: ", err);
    throw new Error("MongoDB connection error");
  }
};

export default connect;
