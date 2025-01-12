import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminPanel from "./components/AdminPanel";
import CashierPanel from "./components/CashierPanel";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Orders from "./pages/Orders";
import Dishes from "./pages/Dishes";
import Logout from "./components/Logout"; // Import Logout component

const App = () => {
  const token = localStorage.getItem("token");
  let role = null;

  if (token) {
    try {
      role = JSON.parse(atob(token.split(".")[1])).role;
      console.log("Role from token:", role);
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("token");
    }
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            token ? <Navigate to={`/${role}`} /> : <Navigate to="/login" />
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/admin"
          element={
            token && role === "admin" ? (
              <AdminPanel />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/cashier"
          element={
            token && role === "cashier" ? (
              <CashierPanel />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/orders" element={<Orders />} />
        <Route path="/admin/dishes" element={<Dishes />} />
        <Route path="/logout" element={<Logout />} /> {/* Add Logout route */}
        <Route
          path="*"
          element={
            token ? <Navigate to={`/${role}`} /> : <Navigate to="/login" />
          }
        />{" "}
        {/* Catch-all route */}
      </Routes>
    </Router>
  );
};

export default App;
