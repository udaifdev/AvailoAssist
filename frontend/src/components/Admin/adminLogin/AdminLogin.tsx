import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { set_admin_Credentials } from "../../../slice/adminSlice";
import { RootState } from "../../../store";
import { adminAxios } from "../../../API/axios";


const AdminLogin = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { AdminDetails } = useSelector((state: RootState) => state.admin);
  // Redirect authenticated users to the home page
  useEffect(() => {
    if (AdminDetails) {
      navigate("/admin-dashboard");
    }
  }, [AdminDetails, navigate]);


  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Form validation
    if (!username || !password) {
      setError("Both fields are required.");
      toast.error("Both fields are required!");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await adminAxios.post("/admin/admin-login", {
        username,
        password,
      });
      if (response.status === 200 || response.status === 201) {
        dispatch(set_admin_Credentials(response.data))
        toast.success("Login successful!", { position: "top-center" });
        navigate("/admin-dashboard");
      }

    } catch (err: any) {
      setError("Invalid credentials. Please try again.");
      toast.error(err.response?.data?.message || "Login failed.", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-10 flex flex-col items-center justify-center">
      <header className="text-center mb-8">
        <h1 className="text-6xl font-bold text-teal-800">AVAILOASSIST</h1>
        <p className="text-2xl text-green-800 font-semibold">ADMIN</p>
      </header>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-16 w-full px-4 lg:px-16">
        <div className="bg-white shadow-lg rounded-lg p-8 border border-teal-700 w-full max-w-md h-[400px]">
          <h2 className="text-center text-2xl font-bold text-teal-700 mb-6">ADMIN LOGIN</h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="w-full px-2 text-teal-800">Full Name :</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your Name..."
                className="w-full mt-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div className="mb-6">
              <label className="w-full px-2 text-teal-800">Password :</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your Password..."
                className="w-full px-4 mt-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-teal-700 text-white py-2 rounded-lg hover:bg-teal-800 transition"
              disabled={loading}
            >
              {loading ? (
                <span className="loader">Loading...</span>
              ) : (
                "Login"
              )}
            </button>
          </form>
          <h2 className="text-center text-sm font-bold text-teal-700 mt-4">
            Access is restricted to admins only
          </h2>
        </div>

        <div className="w-full max-w-md">
          <img
            src="https://tms.ashoktailors.com/public/backend/img/admin-login.jpg"
            alt="Admin Illustration"
            className="h-[400px] object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;