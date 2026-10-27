const express = require("express");
const mongoose = require("mongoose");
const Employee = require("../models/Employee");

const router = express.Router();

// Xử lý lỗi chung
function handleError(res, error) {
  console.error(error);

  if (error.code === 11000) {
    return res.status(409).json({
      message: "Ma nhan vien da ton tai"
    });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: error.message
    });
  }

  return res.status(500).json({
    message: "Loi may chu"
  });
}

// Tìm nhân viên theo MongoDB ID hoặc employeeId
async function findEmployee(id) {
  if (mongoose.isValidObjectId(id)) {
    const employee = await Employee.findById(id);
    if (employee) return employee;
  }

  return Employee.findOne({ employeeId: id });
}

// GET: Lấy danh sách và tìm kiếm nhân viên
router.get("/", async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();

    let filter = {};

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter = {
        $or: [
          { employeeId: { $regex: escaped, $options: "i" } },
          { fullName: { $regex: escaped, $options: "i" } }
        ]
      };
    }

    const employees = await Employee.find(filter).sort({
      employeeId: 1
    });

    res.status(200).json(employees);
  } catch (error) {
    handleError(res, error);
  }
});

// GET: Lấy một nhân viên
router.get("/:id", async (req, res) => {
  try {
    const employee = await findEmployee(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Khong tim thay nhan vien"
      });
    }

    res.status(200).json(employee);
  } catch (error) {
    handleError(res, error);
  }
});

// POST: Thêm nhân viên
router.post("/", async (req, res) => {
  try {
    const { employeeId, fullName, email } = req.body;

    if (
      typeof employeeId !== "string" || !employeeId.trim() ||
      typeof fullName !== "string" || !fullName.trim() ||
      typeof email !== "string" || !email.trim()
    ) {
      return res.status(400).json({
        message: "Ma nhan vien, ho ten va email la bat buoc"
      });
    }

    const employee = await Employee.create(req.body);

    res.status(201).json({
      message: "Them nhan vien thanh cong",
      employee
    });
  } catch (error) {
    handleError(res, error);
  }
});

// PUT: Cập nhật nhân viên
router.put("/:id", async (req, res) => {
  try {
    const employee = await findEmployee(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Khong tim thay nhan vien"
      });
    }

    const allowedFields = [
      "employeeId",
      "fullName",
      "gender",
      "dateOfBirth",
      "department",
      "position",
      "email",
      "phone",
      "hireDate",
      "status"
    ];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        employee[field] = req.body[field];
      }
    }

    await employee.save();

    res.status(200).json({
      message: "Cap nhat nhan vien thanh cong",
      employee
    });
  } catch (error) {
    handleError(res, error);
  }
});

// DELETE: Xóa nhân viên
router.delete("/:id", async (req, res) => {
  try {
    const employee = await findEmployee(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Khong tim thay nhan vien"
      });
    }

    await employee.deleteOne();

    res.status(200).json({
      message: "Xoa nhan vien thanh cong"
    });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;