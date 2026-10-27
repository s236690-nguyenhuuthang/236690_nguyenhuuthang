const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, "Ma nhan vien la bat buoc"],
      unique: true,
      trim: true
    },

    fullName: {
      type: String,
      required: [true, "Ho ten la bat buoc"],
      trim: true
    },

    gender: {
      type: String,
      enum: ["Nam", "Nu", "Khac"],
      default: "Khac"
    },

    dateOfBirth: {
      type: String,
      default: ""
    },

    department: {
      type: String,
      default: ""
    },

    position: {
      type: String,
      default: ""
    },

    email: {
      type: String,
      required: [true, "Email la bat buoc"],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email khong hop le"]
    },

    phone: {
      type: String,
      default: ""
    },

    hireDate: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["Dang lam viec", "Tam nghi", "Da nghi viec"],
      default: "Dang lam viec"
    }
  },
  {
    collection: "employees",
    timestamps: true
  }
);

module.exports = mongoose.model("Employee", employeeSchema);