import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-lg font-bold">
          Restaurant Management
        </Link>
        <div className="flex gap-4">
          <Link to="/admin/users" className="text-white">
            Users
          </Link>
          <Link to="/admin/orders" className="text-white">
            Orders
          </Link>
          <Link to="/admin/dishes" className="text-white">
            Dishes
          </Link>
          <Link to="/logout" className="text-white">
            Logout
          </Link>{" "}
          {/* Add Logout link */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
