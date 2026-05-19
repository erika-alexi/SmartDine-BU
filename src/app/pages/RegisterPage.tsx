import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { ArrowLeft, User, Mail, Lock, IdCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    accountType: 'student'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const buEmailPattern = /^[a-z]{2,4}\d{4}-\d{4}-\d{5}@bicol-u\.edu\.ph$/i;
    if (!buEmailPattern.test(formData.email)) {
      toast.error('Invalid BU email format', {
        description: 'Format: initials + student number @bicol-u.edu.ph (e.g., jdc2024-1234-56789@bicol-u.edu.ph)'
      });
      return;
    }

    setLoading(true);

    const success = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.accountType === 'student' ? formData.studentId : undefined
    );

    if (success) {
      toast.success('Registration successful!');
      navigate('/menu');
    } else {
      toast.error('Registration failed', {
        description: 'If Supabase email confirmation is enabled, confirm the email first or disable confirmations for the demo.'
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
            <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">Create Account</h1>
            <p className="text-gray-600">Register with your Bicol University credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, accountType: 'student' })}
                  className={`flex-1 py-2 rounded-lg font-medium ${
                    formData.accountType === 'student'
                      ? 'bg-[#F57C00] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, accountType: 'faculty' })}
                  className={`flex-1 py-2 rounded-lg font-medium ${
                    formData.accountType === 'faculty'
                      ? 'bg-[#F57C00] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Faculty/Staff
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Juan Dela Cruz"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F57C00]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                BU Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jdc2024-1234-56789@bicol-u.edu.ph"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F57C00]"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Format: name initials + numbers @bicol-u.edu.ph
              </p>
            </div>

            {formData.accountType === 'student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID (Optional)
                </label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    placeholder="2024-1234-56789"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F57C00]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="At least 6 characters"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F57C00]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
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
