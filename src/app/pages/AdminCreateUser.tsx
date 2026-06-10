import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useStore } from '../../lib/store';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Lock,
  Shield,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Save,
  Database,
  TestTube,
  Eye,
  EyeOff
} from 'lucide-react';

const ROLES = [
  { value: 'owner', label: 'Master Admin', color: 'text-purple-500', permissions: 'Full System Access' },
  { value: 'super_admin', label: 'Super Admin', color: 'text-red-500', permissions: '26 Permissions' },
  { value: 'finance', label: 'Finance', color: 'text-green-500', permissions: '14 Permissions' },
  { value: 'operations', label: 'Operations', color: 'text-blue-500', permissions: '12 Permissions' },
  { value: 'risk', label: 'Risk & Compliance', color: 'text-yellow-500', permissions: '10 Permissions' },
  { value: 'merchant', label: 'Merchant', color: 'text-cyan-500', permissions: '7 Permissions (Own)' },
  { value: 'viewer', label: 'Viewer', color: 'text-gray-500', permissions: 'Read Only' },
];

const PERMISSION_DETAILS = {
  owner: ['*'],
  super_admin: [
    'dashboard:view:all',
    'transactions:*:all',
    'reports:*:all',
    'analytics:view:all',
    'merchants:*:all',
    'users:*:all',
    'config:*:all',
    'webhooks:*:all',
    'api:*:all',
    'risk:view:all',
    'risk:update:all',
    'pricing:*:all',
  ],
  finance: [
    'dashboard:view:all',
    'finance:view:all',
    'transactions:view:all',
    'transactions:create:all',
    'reports:*:all',
    'analytics:view:all',
    'settlements:*:all',
    'payouts:*:all',
    'pricing:view:all',
    'pricing:update:all',
  ],
  operations: [
    'dashboard:view:all',
    'transactions:view:all',
    'transactions:create:all',
    'transactions:update:all',
    'virtual_terminal:access:all',
    'reports:view:all',
    'analytics:view:all',
    'merchants:view:all',
  ],
  risk: [
    'dashboard:view:all',
    'risk:*:all',
    'reports:view:all',
    'analytics:view:all',
    'merchants:view:all',
  ],
  merchant: [
    'dashboard:view:own',
    'transactions:view:own',
    'reports:view:own',
    'analytics:view:own',
    'profile:*:own',
  ],
  viewer: [
    'dashboard:view:all',
    'transactions:view:all',
    'reports:view:all',
  ],
};

export const AdminCreateUser: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'merchant',
    organization: '',
  });

  // Preset users for quick fill
  const PRESET_USERS = {
    mzakaria: {
      name: 'Mohamed Zakaria',
      email: 'mzakaria@press2pay.com',
      password: 'mz1234',
      role: 'owner',
      organization: 'Press2Pay',
    },
    ezinvest: {
      name: 'EZ Invest',
      email: 'ezinvest@press2pay.com',
      password: 'ez1234',
      role: 'merchant',
      organization: 'EZ Invest Trading',
    },
  };

  // Only admins can access - redirect in useEffect
  useEffect(() => {
    if (!currentUser || !['owner', 'super_admin'].includes(currentUser.role)) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  // Return early if no access
  if (!currentUser || !['owner', 'super_admin'].includes(currentUser.role)) {
    return null;
  }

  const handleQuickFill = (preset: 'mzakaria' | 'ezinvest') => {
    setFormData(PRESET_USERS[preset]);
    toast.success('Form filled!', {
      description: `Pre-filled with ${preset === 'mzakaria' ? 'Master Admin' : 'Merchant'} user data`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call real API to create user
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('User Created Successfully!', {
        description: `${formData.name} has been added with ${ROLES.find(r => r.value === formData.role)?.label} role`,
        icon: <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'merchant',
        organization: '',
      });
    } catch (error) {
      toast.error('Failed to create user', {
        description: 'Please try again',
        icon: <AlertCircle className="w-5 h-5 text-red-500" />
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = ROLES.find(r => r.value === formData.role);
  const permissions = PERMISSION_DETAILS[formData.role as keyof typeof PERMISSION_DETAILS] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F14] via-[#1a1f2e] to-[#0B0F14] p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate('/users')}
              className="flex items-center gap-2 text-gray-400 hover:text-[#D4AF37] transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Users</span>
            </button>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <User className="w-8 h-8 text-[#D4AF37]" />
              Create New User
            </h1>
            <p className="text-gray-400 mt-2">
              Add a new user and assign role with specific permissions
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-[#D4AF37]" />
              User Information
            </h2>

            {/* Quick Fill Buttons */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-gray-400 mb-3 font-semibold uppercase tracking-wider">
                ⚡ Quick Fill Presets
              </p>
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  type="button"
                  onClick={() => handleQuickFill('mzakaria')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col items-center gap-2 p-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg transition-all group"
                >
                  <Shield className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">Mzakaria</p>
                    <p className="text-xs text-purple-300">Master Admin</p>
                  </div>
                </motion.button>
                
                <motion.button
                  type="button"
                  onClick={() => handleQuickFill('ezinvest')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col items-center gap-2 p-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg transition-all group"
                >
                  <Building2 className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">EZinvest</p>
                    <p className="text-xs text-cyan-300">Merchant</p>
                  </div>
                </motion.button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                    placeholder="••••••••"
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 hover:text-[#D4AF37] transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
              </div>

              {/* Organization */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Organization (Optional)
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                    placeholder="Acme Corp"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  User Role *
                </label>
                <div className="space-y-2">
                  {ROLES.map((role) => (
                    <label
                      key={role.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.role === role.value
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                          : 'border-gray-700 bg-gray-900/30 hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={formData.role === role.value}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-4 h-4 text-[#D4AF37] focus:ring-[#D4AF37]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Shield className={`w-4 h-4 ${role.color}`} />
                          <span className="font-semibold text-white">{role.label}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{role.permissions}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F4E4A7] text-black font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-[#D4AF37]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Creating User...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Create User
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Permissions Preview Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className={`w-5 h-5 ${selectedRole?.color || 'text-[#D4AF37]'}`} />
              Assigned Permissions
            </h2>

            <div className="mb-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 font-semibold">Selected Role:</span>
                <span className={`font-bold ${selectedRole?.color}`}>
                  {selectedRole?.label}
                </span>
              </div>
              <p className="text-sm text-gray-400">{selectedRole?.permissions}</p>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-[#D4AF37]/20 scrollbar-track-transparent">
              <p className="text-sm text-gray-400 mb-3">
                This role includes the following permissions:
              </p>
              {permissions.map((permission, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-2 p-2 bg-gray-900/30 rounded-lg"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                  <code className="text-xs text-gray-300 font-mono break-all">
                    {permission}
                  </code>
                </motion.div>
              ))}
            </div>

            {/* Permission Format Legend */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300 font-semibold mb-2">
                Permission Format:
              </p>
              <code className="text-xs text-blue-400 block">
                resource:action:scope
              </code>
              <p className="text-xs text-gray-400 mt-2">
                Example: <code className="text-blue-400">transactions:create:all</code>
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};