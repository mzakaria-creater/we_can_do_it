import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple auth - any credentials work for demo
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-obsidian-900 via-black to-obsidian-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/[0.04] backdrop-blur-md border border-gold-500/20 rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-gold-500 mb-2">ONTARGET</h1>
          <p className="text-gray-400 mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold-500"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-gold-500 text-black font-semibold rounded-lg hover:bg-gold-600 transition"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Demo: Use any credentials to proceed
          </p>
        </div>
      </div>
    </div>
  )
}
