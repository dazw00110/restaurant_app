import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const AdminPanel = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/admin/users")}
            className="p-4 bg-indigo-600 text-white rounded"
          >
            Users
          </button>
          <button
            onClick={() => navigate("/admin/orders")}
            className="p-4 bg-indigo-600 text-white rounded"
          >
            Orders
          </button>
          <button
            onClick={() => navigate("/admin/dishes")}
            className="p-4 bg-indigo-600 text-white rounded"
          >
            Dishes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
