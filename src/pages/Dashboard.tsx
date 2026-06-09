import { Link } from 'react-router-dom'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-obsidian-900 via-black to-obsidian-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gold-500 mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome to ONTARGET Nexus</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Volume', value: '$2.4M', change: '+12.5%' },
            { label: 'Active Records', value: '1,247', change: '+8.2%' },
            { label: 'Settlement Rate', value: '98.5%', change: '+2.1%' },
            { label: 'Pending', value: '89', change: '-5.3%' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/[0.04] backdrop-blur-md border border-gold-500/20 rounded-2xl p-6">
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold text-gold-500 mt-2">{stat.value}</p>
              <p className="text-green-400 text-sm mt-2">{stat.change}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/[0.04] backdrop-blur-md border border-gold-500/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gold-500 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-white/10 rounded-lg">
                <div>
                  <p className="font-semibold text-white">Transaction #{i}</p>
                  <p className="text-gray-400 text-sm">2 hours ago</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gold-500">+$45,250</p>
                  <p className="text-green-400 text-sm">Completed</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-gray-400 hover:text-gold-500 transition"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
