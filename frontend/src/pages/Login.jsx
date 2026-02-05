import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin, loginJudge } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [userType, setUserType] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (userType === 'admin') {
        response = await loginAdmin(formData);
      } else {
        response = await loginJudge(formData);
      }

      login(response, response.token);
      navigate(userType === 'admin' ? '/admin' : '/judge');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              AI Summit Evaluation
            </h1>
            <p className="text-primary-100 text-sm sm:text-base">
              Select your role to continue
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setUserType('admin')}
              className="w-full bg-white hover:bg-gray-50 text-primary-600 font-semibold py-4 px-6 rounded-lg shadow-lg transition transform hover:scale-105"
            >
              <div className="text-4xl mb-2">👨‍💼</div>
              <div className="text-xl">Admin Login</div>
              <p className="text-sm text-gray-600 mt-1">
                Manage teams, judges, and view analytics
              </p>
            </button>

            <button
              onClick={() => setUserType('judge')}
              className="w-full bg-white hover:bg-gray-50 text-primary-600 font-semibold py-4 px-6 rounded-lg shadow-lg transition transform hover:scale-105"
            >
              <div className="text-4xl mb-2">⚖️</div>
              <div className="text-xl">Judge Login</div>
              <p className="text-sm text-gray-600 mt-1">
                Evaluate teams and view leaderboards
              </p>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-primary-100 text-xs sm:text-sm">
              AI Summit Hackathon 2026
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {userType === 'admin' ? 'Admin' : 'Judge'} Login
            </h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Enter your credentials to continue
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-field"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-base sm:text-lg py-3"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <button
              type="button"
              onClick={() => {
                setUserType(null);
                setFormData({ email: '', password: '' });
                setError('');
              }}
              className="w-full btn-secondary"
            >
              Back
            </button>
          </form>

          {userType === 'admin' && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded text-sm">
              <p className="font-medium text-blue-900 mb-1">Default Admin Credentials:</p>
              <p className="text-blue-800">Email: admin@aisummit.com</p>
              <p className="text-blue-800">Password: admin123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
