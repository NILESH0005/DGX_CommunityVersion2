import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  CartesianGrid
} from "recharts";
import {
  FaUsers,
  FaChartLine,
  FaComments,
  FaCheckCircle,
  FaBell,
  FaMedal,
  FaBookOpen,
  FaBrain
} from "react-icons/fa";


const Dashboard = () => {
  const [filter, setFilter] = useState("Monthly");

  // Dummy Data
  const userStats = [
    { name: "Mon", users: 120 },
    { name: "Tue", users: 180 },
    { name: "Wed", users: 140 },
    { name: "Thu", users: 200 },
    { name: "Fri", users: 170 },
    { name: "Sat", users: 250 },
    { name: "Sun", users: 190 },
  ];

  const moduleActivity = [
    { module: "Discussion", count: 320 },
    { module: "Blogs", count: 240 },
    { module: "Events", count: 190 },
    { module: "Quiz", count: 260 },
    { module: "LMS", count: 300 },
  ];

  const qualityVsQuantity = [
    { user: "User A", quantity: 12, quality: 90 },
    { user: "User B", quantity: 8, quality: 70 },
    { user: "User C", quantity: 20, quality: 40 },
    { user: "User D", quantity: 10, quality: 85 },
    { user: "User E", quantity: 15, quality: 95 },
  ];

  const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#f59e0b", "#8b5cf6"];

  const pendingApprovals = [
    { id: 1, type: "Blog", author: "Riya Sharma", title: "AI in Education", date: "2025-11-01", status: "Pending" },
    { id: 2, type: "Event", author: "Amit Singh", title: "Tech Summit 2025", date: "2025-11-04", status: "Pending" },
    { id: 3, type: "Discussion", author: "Priya Verma", title: "Climate Policy", date: "2025-11-02", status: "Pending" },
  ];

  const topPerformers = [
    { name: "Riya Sharma", badge: "🏆 Best Performer", score: 98 },
    { name: "Amit Singh", badge: "💎 Quality Contributor", score: 94 },
    { name: "Karan Patel", badge: "⚡ Fast Responder", score: 91 },
  ];

  const engagementData = [
    { name: "Discussions", value: 400 },
    { name: "Blogs", value: 300 },
    { name: "Events", value: 200 },
    { name: "Quiz", value: 150 },
    { name: "LMS", value: 250 },
  ];

  const totalKPIs = [
    { title: "Active Users", value: "1,245", icon: <FaUsers /> },
    { title: "Total Posts", value: "894", icon: <FaComments /> },
    { title: "Pending Approvals", value: "12", icon: <FaCheckCircle /> },
    { title: "Engagement Rate", value: "76%", icon: <FaChartLine /> },
    { title: "Quiz Attempts", value: "430", icon: <FaBrain /> },
  ];

  return (
    <div className="p-6 space-y-10">
      {/* ===== 1. Header Overview ===== */}
      <h1 className="text-3xl font-bold mb-6">📊 Admin Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {totalKPIs.map((kpi, i) => (
          <div key={i} className="bg-white p-4 shadow rounded-xl flex items-center space-x-4">
            <div className="text-blue-600 text-3xl">{kpi.icon}</div>
            <div>
              <p className="text-gray-500 text-sm">{kpi.title}</p>
              <p className="text-xl font-bold">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ===== 2. User Monitoring ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-3">User Activity (Weekly)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={userStats}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-3">Module-Wise Engagement</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={moduleActivity}>
              <XAxis dataKey="module" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== 3. Top Performers ===== */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4 flex items-center"><FaMedal className="mr-2 text-yellow-500" />Top Performers ({filter})</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topPerformers.map((p, i) => (
            <div key={i} className="border p-4 rounded-xl text-center shadow-sm hover:shadow-md transition">
              <h3 className="font-bold text-lg">{p.name}</h3>
              <p className="text-sm text-gray-500">{p.badge}</p>
              <p className="mt-2 text-blue-600 font-bold text-xl">{p.score}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== 4. Quality vs Quantity ===== */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-3">Quality vs Quantity</h2>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid />
            <XAxis dataKey="quantity" name="Posts" />
            <YAxis dataKey="quality" name="Quality Score" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={qualityVsQuantity} fill="#8b5cf6" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* ===== 5. Badge & Recognition ===== */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-3">Suggested Badge Recipients</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {topPerformers.map((u, i) => (
            <div key={i} className="border p-4 rounded-xl text-center shadow-sm">
              <p className="font-bold">{u.name}</p>
              <p className="text-sm text-gray-500 mb-3">{u.badge}</p>
              <div className="flex justify-center space-x-3">
                <button className="bg-green-500 text-white px-3 py-1 rounded">Approve</button>
                <button className="bg-red-500 text-white px-3 py-1 rounded">Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== 6. Pending Approvals ===== */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-3">Pending Content Approvals</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Author</th>
              <th className="p-2 text-left">Title</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingApprovals.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{item.type}</td>
                <td className="p-2">{item.author}</td>
                <td className="p-2">{item.title}</td>
                <td className="p-2">{item.date}</td>
                <td className="p-2 text-yellow-600 font-semibold">{item.status}</td>
                <td className="p-2 space-x-2">
                  <button className="text-green-600 font-semibold">Approve</button>
                  <button className="text-red-600 font-semibold">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== 7. Analytics & Insights ===== */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-3">Engagement Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={engagementData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              label
            >
              {engagementData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* ===== 8. Notifications ===== */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <FaBell className="mr-2 text-red-500" /> Notifications & Alerts
        </h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>3 Blogs pending approval</li>
          <li>1 Event awaiting admin review</li>
          <li>Low engagement detected in Discussion module</li>
          <li>New badge recommendations ready for review</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
