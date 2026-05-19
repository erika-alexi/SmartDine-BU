import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { ArrowLeft, User, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { hasSupabaseConfig } from '../lib/supabase';
import { toast } from 'sonner';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await login(email, password, 'admin');

    if (success) {
      toast.success('Admin login successful!');
      navigate('/admin/dashboard');
    } else {
      toast.error('Invalid admin credentials');
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4FC3F7] rounded-full mb-4">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">Admin Login</h1>
            <p className="text-gray-600">Access the admin dashboard</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              Admin access requires a Supabase Auth account whose profile role is set to admin.
            </p>
          </div>

          {!hasSupabaseConfig && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                Supabase is not configured for this deployment. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel, then redeploy.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bicol-u.edu.ph"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                />
              </div>
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
                  placeholder="Enter admin password"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4FC3F7] text-white py-3 rounded-lg hover:bg-[#29B6F6] font-semibold disabled:bg-gray-300"
            >
              {loading ? 'Signing In...' : 'Sign In as Admin'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-gray-600">
              Student or faculty?{' '}
              <Link to="/login" className="text-[#F57C00] hover:underline font-medium">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
