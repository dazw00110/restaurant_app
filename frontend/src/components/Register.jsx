import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'cashier',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/register', formData);
      navigate('/login');
    } catch (error) {
      console.error('Registration error', error);
    }
  };

  return (
    <form onSubmit={handleRegister} className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4">Rejestracja</h1>
      <input
        type="text"
        name="firstName"
        placeholder="Imię"
        value={formData.firstName}
        onChange={handleChange}
        className="w-full p-2 mb-4 border rounded"
      />
      <input
        type="text"
        name="lastName"
        placeholder="Nazwisko"
        value={formData.lastName}
        onChange={handleChange}
        className="w-full p-2 mb-4 border rounded"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="w-full p-2 mb-4 border rounded"
      />
      <input
        type="password"
        name="password"
        placeholder="Hasło"
        value={formData.password}
        onChange={handleChange}
        className="w-full p-2 mb-4 border rounded"
      />
      <button type="submit" className="w-full p-2 bg-indigo-600 text-white rounded">Zarejestruj się</button>
      <p className="mt-4 text-center">
        Masz już konto? <a href="/login" className="text-indigo-600">Zaloguj się</a>
      </p>
    </form>
  );
};

export default Register;