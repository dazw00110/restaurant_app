import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) {
      setError("Password cannot be empty");
      return;
    }
    try {
      console.log("Sending login request:", { email, password });
      const response = await axios.post(
        "http://localhost:5000/api/users/login",
        { email, password }
      );
      const { token, role } = response.data;
      console.log("Login successful:", { token, role });
      localStorage.setItem("token", token);
      console.log("Stored token:", localStorage.getItem("token"));
      if (role === "admin") {
        console.log("Navigating to /admin");
        navigate("/admin");
      } else if (role === "cashier") {
        console.log("Navigating to /cashier");
        navigate("/cashier");
      } else {
        console.error("Unknown role:", role);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Nieprawidłowy email lub hasło");
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow-md"
    >
      <h1 className="text-2xl font-bold mb-4">Logowanie</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />
      <input
        type="password"
        placeholder="Hasło"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />
      <button
        type="submit"
        className="w-full p-2 bg-indigo-600 text-white rounded"
      >
        Zaloguj
      </button>
      <p className="mt-4 text-center">
        Nie masz konta?{" "}
        <a href="/register" className="text-indigo-600">
          Zarejestruj się
        </a>
      </p>
    </form>
  );
};

export default Login;
