import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalSessions: number;
    totalPageViews: number;
    averageSessionDuration: number;
    bounceRate: number;
    conversionRate: number;
  };
  traffic: {
    daily: Array<{ date: string; users: number; sessions: number; pageViews: number }>;
    sources: Array<{ source: string; users: number; percentage: number }>;
    devices: Array<{ device: string; users: number; percentage: number }>;
  };
  performance: {
    coreWebVitals: {
      lcp: { value: number; rating: string };
      fid: { value: number; rating: string };
      cls: { value: number; rating: string };
    };
    pageLoadTimes: Array<{ page: string; averageTime: number; p95Time: number }>;
  };
  userBehavior: {
    topPages: Array<{ page: string; views: number; avgTime: number }>;
    userFlow: Array<{ from: string; to: string; users: number }>;
    events: Array<{ event: string; count: number; uniqueUsers: number }>;
  };
  conversion: {
    funnels: Array<{ step: string; users: number; conversionRate: number }>;
    goals: Array<{ goal: string; completions: number; value: number }>;
  };
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: string;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, color }) => {
  const changeColor = change && change > 0 ? 'text-green-600' : change && change < 0 ? 'text-red-600' : 'text-gray-600';
  const changeIcon = change && change > 0 ? '↗' : change && change < 0 ? '↘' : '→';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <p className={`text-sm ${changeColor} flex items-center mt-1`}>
              <span className="mr-1">{changeIcon}</span>
              {Math.abs(change).toFixed(1)}%
            </p>
          )}
        </div>
        <div className="text-3xl" style={{ color }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshInterval, setRefreshInterval] = useState(30000);

  useEffect(() => {
    fetchAnalyticsData();
    const interval = setInterval(fetchAnalyticsData, refreshInterval);
    return () => clearInterval(interval);
  }, [timeRange, refreshInterval]);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(`/api/analytics/dashboard?timeRange=${timeRange}`);
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load analytics data</p>
        <button
          onClick={fetchAnalyticsData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">DevDeck performance and user insights</p>
          </div>
          <div className="flex space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button
              onClick={fetchAnalyticsData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <MetricCard
          title="Total Users"
          value={formatNumber(data.overview.totalUsers)}
          icon="👥"
          color="#667eea"
        />
        <MetricCard
          title="Sessions"
          value={formatNumber(data.overview.totalSessions)}
          icon="📱"
          color="#764ba2"
        />
        <MetricCard
          title="Page Views"
          value={formatNumber(data.overview.totalPageViews)}
          icon="👁️"
          color="#f093fb"
        />
        <MetricCard
          title="Avg Session"
          value={formatDuration(data.overview.averageSessionDuration)}
          icon="⏱️"
          color="#f5576c"
        />
        <MetricCard
          title="Bounce Rate"
          value={`${(data.overview.bounceRate * 100).toFixed(1)}%`}
          icon="🚪"
          color="#4facfe"
        />
        <MetricCard
          title="Conversion"
          value={`${(data.overview.conversionRate * 100).toFixed(1)}%`}
          icon="🎯"
          color="#00f2fe"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Traffic Trend */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">📈 Traffic Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.traffic.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="users" stackId="1" stroke="#667eea" fill="#667eea" fillOpacity={0.6} />
              <Area type="monotone" dataKey="sessions" stackId="1" stroke="#764ba2" fill="#764ba2" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">🌐 Traffic Sources</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.traffic.sources}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ source, percentage }) => `${source} (${percentage.toFixed(1)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="users"
              >
                {data.traffic.sources.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Core Web Vitals */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">⚡ Core Web Vitals</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Largest Contentful Paint</span>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold">{data.performance.coreWebVitals.lcp.value}ms</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  data.performance.coreWebVitals.lcp.rating === 'good' ? 'bg-green-100 text-green-800' :
                  data.performance.coreWebVitals.lcp.rating === 'needs-improvement' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {data.performance.coreWebVitals.lcp.rating}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">First Input Delay</span>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold">{data.performance.coreWebVitals.fid.value}ms</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  data.performance.coreWebVitals.fid.rating === 'good' ? 'bg-green-100 text-green-800' :
                  data.performance.coreWebVitals.fid.rating === 'needs-improvement' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {data.performance.coreWebVitals.fid.rating}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Cumulative Layout Shift</span>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold">{data.performance.coreWebVitals.cls.value.toFixed(3)}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  data.performance.coreWebVitals.cls.rating === 'good' ? 'bg-green-100 text-green-800' :
                  data.performance.coreWebVitals.cls.rating === 'needs-improvement' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {data.performance.coreWebVitals.cls.rating}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">📄 Top Pages</h3>
          <div className="space-y-3">
            {data.userBehavior.topPages.slice(0, 5).map((page, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <p className="font-medium text-sm">{page.page}</p>
                  <p className="text-xs text-gray-500">Avg time: {formatDuration(page.avgTime)}</p>
                </div>
                <span className="font-bold text-blue-600">{formatNumber(page.views)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Device and Conversion Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Device Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">📱 Device Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.traffic.devices}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="device" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="users" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">🎯 Conversion Funnel</h3>
          <div className="space-y-3">
            {data.conversion.funnels.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{step.step}</span>
                  <span className="text-sm text-gray-600">
                    {formatNumber(step.users)} users ({(step.conversionRate * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${step.conversionRate * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
