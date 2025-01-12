import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const CashierPanel = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Cashier Panel</h1>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/cashier/orders")}
            className="p-4 bg-indigo-600 text-white rounded"
          >
            Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashierPanel;
