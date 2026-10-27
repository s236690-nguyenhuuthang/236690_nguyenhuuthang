require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const employeeRoutes = require("./routes/employeeRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API kiểm tra trạng thái Backend
app.get("/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    status: connected ? "OK" : "UNAVAILABLE",
    database: connected ? "Connected" : "Disconnected"
  });
});

// API quản lý nhân viên
app.use("/api/employees", employeeRoutes);

// Xử lý endpoint không tồn tại
app.use((req, res) => {
  res.status(404).json({
    message: "Endpoint khong ton tai"
  });
});

// Xử lý JSON không hợp lệ và lỗi khác
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      message: "JSON khong hop le"
    });
  }

  console.error(err);

  res.status(500).json({
    message: "Loi may chu"
  });
});

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Thieu bien moi truong MONGODB_URI");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
  dbName: process.env.DB_NAME
});

console.log("Database:", mongoose.connection.name);
console.log("Connected to MongoDB Atlas");
    console.log("Connected to MongoDB Atlas");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

startServer();