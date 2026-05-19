import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { ArrowLeft, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await login(email, password, 'user');

    if (success) {
      toast.success('Login successful!');
      navigate('/menu');
    } else {
      toast.error('Invalid credentials', {
        description: 'Please check your BU email and password'
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen py-6 sm:py-8">
      <div className="max-w-md mx-auto px-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#F57C00] mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Home
        </button>

        <div className="rounded-lg bg-white p-5 shadow-lg sm:p-8">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">Users Login</h1>
            <p className="text-gray-600">Sign in with your Bicol University account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                BU Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jdc2024-1234-56789@bicol-u.edu.ph"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F57C00]"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Use your BU email (initials + numbers @bicol-u.edu.ph)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F57C00]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F57C00] text-white py-3 rounded-lg hover:bg-[#E65100] font-semibold disabled:bg-gray-300"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#F57C00] hover:underline font-medium">
                Register here
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t">
            <p className="text-center text-sm text-gray-600">
              Canteen Admin or Staff?{' '}
              <Link to="/admin/login" className="text-[#4FC3F7] hover:underline font-medium">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
