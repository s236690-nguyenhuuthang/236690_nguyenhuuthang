
import { useEffect, useState } from "react";
import {
  Users, Plus, Search, Pencil, Trash2,
  X, Save, RefreshCw, LoaderCircle
} from "lucide-react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;
console.log("API_URL:", API_URL);

const emptyForm = {
  employeeId: "",
  fullName: "",
  gender: "Nam",
  dateOfBirth: "",
  department: "",
  position: "",
  email: "",
  phone: "",
  hireDate: "",
  status: "Dang lam viec"
};

const fields = [
  ["employeeId", "Mã nhân viên", "text"],
  ["fullName", "Họ và tên", "text"],
  ["dateOfBirth", "Ngày sinh", "date"],
  ["department", "Phòng ban", "text"],
  ["position", "Chức vụ", "text"],
  ["email", "Email", "email"],
  ["phone", "Số điện thoại", "tel"],
  ["hireDate", "Ngày vào làm", "date"]
];

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Thao tác thất bại");
  }

  return data;
}

function App() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const notify = (text, type = "success") => {
    setMessage({ text, type });
  };

  const loadEmployees = async (keyword = "") => {
    setLoading(true);

    try {
      const query = keyword.trim()
        ? `?search=${encodeURIComponent(keyword.trim())}`
        : "";

      const data = await request(API_URL + query);
      setEmployees(data);
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowForm(true);
    setMessage(null);
  };

  const openEdit = (employee) => {
    setEditingId(employee._id);
    setForm({
      ...emptyForm,
      ...Object.fromEntries(
        Object.keys(emptyForm).map((key) => [
          key,
          employee[key] ?? emptyForm[key]
        ])
      ),
      dateOfBirth: employee.dateOfBirth?.slice(0, 10) || "",
      hireDate: employee.hireDate?.slice(0, 10) || ""
    });
    setShowForm(true);
    setMessage(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.employeeId.trim() ||
        !form.fullName.trim() ||
        !form.email.trim()) {
      notify("Vui lòng nhập mã, họ tên và email", "error");
      return;
    }

    setSaving(true);

    try {
      const isEditing = Boolean(editingId);

      await request(
        isEditing ? `${API_URL}/${editingId}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        }
      );

      closeForm();
      await loadEmployees(search);

      notify(
        isEditing
          ? "Cập nhật nhân viên thành công"
          : "Thêm nhân viên thành công"
      );
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (employee) => {
    if (!window.confirm(
      `Bạn có chắc muốn xóa nhân viên ${employee.fullName}?`
    )) return;

    try {
      await request(`${API_URL}/${employee._id}`, {
        method: "DELETE"
      });

      await loadEmployees(search);
      notify("Xóa nhân viên thành công");
    } catch (error) {
      notify(error.message, "error");
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    loadEmployees(search);
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><Users size={24} /></div>
          <div>
            <strong>HR Management</strong>
            <span>Quản lý nhân sự</span>
          </div>
        </div>

        <div className="nav-active">
          <Users size={19} />
          Danh sách nhân viên
        </div>

        <div className="sidebar-footer">
          <span>Điện toán đám mây</span>
          <strong>236690 - Nguyễn Hữu Thắng</strong>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <span>Hệ thống quản lý nhân sự</span>
          <span className="user-tag">Admin</span>
        </header>

        <div className="content">
          <div className="page-heading">
            <div>
              <h1>Quản lý nhân viên</h1>
              <p>Quản lý và cập nhật hồ sơ nhân sự</p>
            </div>
            <button className="btn primary" onClick={openAdd}>
              <Plus size={18} /> Thêm nhân viên
            </button>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><Users size={25} /></div>
            <div>
              <span>Nhân viên trong danh sách</span>
              <strong>{employees.length}</strong>
            </div>
          </div>

          {message && (
            <div className={`notice ${message.type}`} role="alert">
              <span>{message.text}</span>
              <button onClick={() => setMessage(null)}>
                <X size={16} />
              </button>
            </div>
          )}

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Danh sách nhân viên</h2>
                <p>Tìm kiếm, xem và quản lý thông tin</p>
              </div>
              <button
                className="btn outline"
                onClick={() => loadEmployees(search)}
                disabled={loading}
              >
                <RefreshCw size={16} /> Làm mới
              </button>
            </div>

            <form className="searchbar" onSubmit={handleSearch}>
              <Search size={19} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo mã hoặc họ tên..."
              />
              <button className="btn primary" type="submit">
                Tìm kiếm
              </button>
            </form>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã NV</th>
                    <th>Họ và tên</th>
                    <th>Phòng ban</th>
                    <th>Chức vụ</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="empty">
                        <LoaderCircle className="spin" size={24} />
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  ) : employees.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="empty">
                        Không có nhân viên nào
                      </td>
                    </tr>
                  ) : employees.map((emp) => (
                    <tr key={emp._id}>
                      <td><strong>{emp.employeeId}</strong></td>
                      <td>{emp.fullName}</td>
                      <td>{emp.department || "-"}</td>
                      <td>{emp.position || "-"}</td>
                      <td>{emp.email}</td>
                      <td>{emp.phone || "-"}</td>
                      <td>
                        <span className={
                          emp.status === "Dang lam viec"
                            ? "status active"
                            : "status inactive"
                        }>
                          {emp.status}
                        </span>
                      </td>
                      <td>
                        <div className="actions">
                          <button
                            title="Xem và sửa"
                            onClick={() => openEdit(emp)}
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            title="Xóa"
                            className="danger-icon"
                            onClick={() => handleDelete(emp)}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {showForm && (
        <div className="modal-overlay" onMouseDown={closeForm}>
          <div
            className="modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>
                  {editingId ? "Thông tin nhân viên" : "Thêm nhân viên"}
                </h2>
                <p>Nhập đầy đủ thông tin hồ sơ</p>
              </div>
              <button onClick={closeForm}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                {fields.map(([name, label, type]) => (
                  <label key={name} className="form-field">
                    <span>{label}</span>
                    <input
                      name={name}
                      type={type}
                      value={form[name]}
                      onChange={handleChange}
                      required={["employeeId", "fullName", "email"]
                        .includes(name)}
                    />
                  </label>
                ))}

                <label className="form-field">
                  <span>Giới tính</span>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nu">Nữ</option>
                    <option value="Khac">Khác</option>
                  </select>
                </label>

                <label className="form-field">
                  <span>Trạng thái</span>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="Dang lam viec">Đang làm việc</option>
                    <option value="Tam nghi">Tạm nghỉ</option>
                    <option value="Da nghi viec">Đã nghỉ việc</option>
                  </select>
                </label>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn outline"
                  onClick={closeForm}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn primary"
                  disabled={saving}
                >
                  <Save size={17} />
                  {saving ? "Đang lưu..." : "Lưu thông tin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
