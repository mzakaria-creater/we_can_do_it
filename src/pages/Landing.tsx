import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-obsidian-900 via-black to-obsidian-900 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-6 text-gold-500">
          ONTARGET Nexus
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl">
          Premium Enterprise Operations Dashboard for MENA Region
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/login"
            className="px-8 py-3 bg-gold-500 text-black font-semibold rounded-lg hover:bg-gold-600 transition"
          >
            Sign In
          </Link>
          <Link
            to="/dashboard"
            className="px-8 py-3 border border-gold-500 text-gold-500 font-semibold rounded-lg hover:bg-gold-500/10 transition"
          >
            Explore
          </Link>
        </div>
      </div>
    </div>
  )
}
