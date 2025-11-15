import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Zap, AlertTriangle, CheckCircle, Clock, TrendingUp, Users, Globe, HardDrive, Cpu } from 'lucide-react';
import api from '@/services/api';

const MonitoringTab = () => {
  const [healthData, setHealthData] = useState(null);
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchMonitoringData = async () => {
    try {
      const [healthRes, metricsRes] = await Promise.all([
        api.get('/monitoring/health/detailed'),
        api.get('/monitoring/metrics')
      ]);

      setHealthData(healthRes.data);
      setMetricsData(metricsRes.data);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchMonitoringData, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'configured':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'unhealthy':
      case 'error':
      case 'disconnected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'configured':
        return 'bg-green-50 border-green-200';
      case 'degraded':
        return 'bg-yellow-50 border-yellow-200';
      case 'unhealthy':
      case 'error':
      case 'disconnected':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="w-12 h-12 text-indigo-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <Activity className="w-7 h-7 text-indigo-600" />
            System Monitoring
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              autoRefresh
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {autoRefresh ? '🔄 Auto-Refresh' : '⏸️ Paused'}
          </button>
          <button
            onClick={fetchMonitoringData}
            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            🔃 Refresh
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className={`mb-6 p-4 rounded-lg border-2 ${getStatusBgColor(healthData?.status)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {healthData?.status === 'healthy' ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            )}
            <div>
              <h3 className="text-lg font-bold text-gray-900 uppercase">
                System Status: {healthData?.status || 'Unknown'}
              </h3>
              <p className="text-sm text-gray-600">
                Environment: {healthData?.environment} | Uptime: {healthData?.uptime_seconds}s
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dependencies */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-1">
            <Database className={`w-5 h-5 ${getStatusColor(healthData?.dependencies?.mongodb?.status)}`} />
            <span className="font-semibold text-sm">MongoDB</span>
          </div>
          <div className={`text-xs font-medium ${getStatusColor(healthData?.dependencies?.mongodb?.status)}`}>
            {healthData?.dependencies?.mongodb?.status || 'Unknown'}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-1">
            <Zap className={`w-5 h-5 ${getStatusColor(healthData?.dependencies?.redis?.status)}`} />
            <span className="font-semibold text-sm">Redis</span>
          </div>
          <div className={`text-xs font-medium ${getStatusColor(healthData?.dependencies?.redis?.status)}`}>
            {healthData?.dependencies?.redis?.status || 'Unknown'}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-1">
            <Globe className={`w-5 h-5 ${getStatusColor(healthData?.dependencies?.elevenlabs?.status)}`} />
            <span className="font-semibold text-sm">ElevenLabs</span>
          </div>
          <div className={`text-xs font-medium ${getStatusColor(healthData?.dependencies?.elevenlabs?.status)}`}>
            {healthData?.dependencies?.elevenlabs?.status || 'Unknown'}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-1">
            <Server className={`w-5 h-5 ${getStatusColor(healthData?.dependencies?.stripe?.status)}`} />
            <span className="font-semibold text-sm">Stripe</span>
          </div>
          <div className={`text-xs font-medium ${getStatusColor(healthData?.dependencies?.stripe?.status)}`}>
            {healthData?.dependencies?.stripe?.status || 'Unknown'}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-1">
            <Server className={`w-5 h-5 ${getStatusColor(healthData?.dependencies?.twilio?.status)}`} />
            <span className="font-semibold text-sm">Twilio</span>
          </div>
          <div className={`text-xs font-medium ${getStatusColor(healthData?.dependencies?.twilio?.status)}`}>
            {healthData?.dependencies?.twilio?.status || 'Unknown'}
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-lg shadow text-white">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-6 h-6 opacity-80" />
            <div className="text-2xl font-bold">{metricsData?.requests?.total || 0}</div>
          </div>
          <div className="text-xs opacity-90">Total Requests</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-lg shadow text-white">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-6 h-6 opacity-80" />
            <div className="text-2xl font-bold">{metricsData?.requests?.success_rate || '0%'}</div>
          </div>
          <div className="text-xs opacity-90">Success Rate</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-lg shadow text-white">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-6 h-6 opacity-80" />
            <div className="text-2xl font-bold">{metricsData?.performance?.avg_response_time_ms || 0}ms</div>
          </div>
          <div className="text-xs opacity-90">Avg Response</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-lg shadow text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6 opacity-80" />
            <div className="text-2xl font-bold">{metricsData?.performance?.slow_requests || 0}</div>
          </div>
          <div className="text-xs opacity-90">Slow Requests</div>
        </div>
      </div>

      {/* System Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-3">
            <HardDrive className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold">Memory Usage</h3>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {metricsData?.system?.memory?.usage_percent || '0%'} - {metricsData?.system?.memory?.used_mb || 0}MB / {metricsData?.system?.memory?.total_mb || 0}MB
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: metricsData?.system?.memory?.usage_percent || '0%' }}
            ></div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold">CPU Info</h3>
          </div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Cores:</span>
              <span className="font-medium">{metricsData?.system?.cpu?.cores || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Load Avg:</span>
              <span className="font-medium">{metricsData?.system?.cpu?.load_avg?.[0] || '0'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Endpoints */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 mb-6">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Top Endpoints
        </h3>
        <div className="space-y-2">
          {metricsData?.requests?.top_endpoints?.slice(0, 5).map((endpoint, index) => (
            <div key={index} className="flex items-center justify-between text-sm bg-white dark:bg-gray-800 p-2 rounded">
              <span className="font-mono text-xs truncate flex-1">{endpoint.endpoint}</span>
              <div className="flex items-center gap-3">
                <span className="text-gray-600 dark:text-gray-400">{endpoint.count} req</span>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  endpoint.avg_response_time_ms > 1000
                    ? 'bg-red-100 text-red-700'
                    : endpoint.avg_response_time_ms > 500
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {endpoint.avg_response_time_ms}ms
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Errors */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Recent Errors
        </h3>
        {metricsData?.recent_errors && metricsData.recent_errors.length > 0 ? (
          <div className="space-y-2">
            {metricsData.recent_errors.slice(0, 3).map((error, index) => (
              <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm">
                <div className="font-semibold text-red-900 dark:text-red-200">{error.error}</div>
                <div className="text-xs text-red-700 dark:text-red-300 mt-1">
                  {error.method} {error.path} - {new Date(error.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm">No recent errors - System running smoothly!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitoringTab;
