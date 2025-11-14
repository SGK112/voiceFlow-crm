import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Phone,
  Users,
  TrendingUp,
  DollarSign,
  ArrowRight,
  PhoneCall,
  UserPlus,
  Library,
  Settings,
  PhoneIncoming,
  PhoneOutgoing,
  Clock
} from 'lucide-react';
import { formatCurrency, formatDuration, formatPhoneNumber } from '@/lib/utils';
import AIInsightsCard from '@/components/AIInsightsCard';

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['metrics'],
    queryFn: async () => {
      const res = await dashboardApi.getMetrics();
      return res.data;
    },
  });

  const { data: callsToday = [] } = useQuery({
    queryKey: ['calls-today'],
    queryFn: async () => {
      const res = await dashboardApi.getCallsToday();
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    { label: 'Deploy AI Agent', icon: Library, path: '/app/agents', color: 'bg-blue-500' },
    { label: 'Add Lead', icon: UserPlus, path: '/app/leads', color: 'bg-green-500' },
    { label: 'Conversations', icon: PhoneCall, path: '/app/conversations', color: 'bg-purple-500' },
    { label: 'Workflows', icon: TrendingUp, path: '/app/workflows', color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Quick Actions - Mobile First */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <Button
            key={action.path}
            variant="outline"
            onClick={() => navigate(action.path)}
            className="h-auto flex-col gap-2 p-4 hover:bg-accent"
          >
            <div className={`p-2 rounded-lg ${action.color} bg-opacity-10`}>
              <action.icon className={`h-5 w-5 ${action.color.replace('bg-', 'text-')}`} />
            </div>
            <span className="text-sm font-medium">{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Key Metrics - Improved Mobile Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Agents */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
              <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.agents?.active || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics?.agents?.total || 0} total • {metrics?.agents?.paused || 0} paused
            </p>
            <Button
              variant="link"
              className="p-0 h-auto mt-2 text-xs"
              onClick={() => navigate('/app/agents')}
            >
              View all agents <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Calls This Month */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calls This Month</CardTitle>
            <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-lg">
              <PhoneCall className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.thisMonth?.calls || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics?.calls?.successRate || 0}% success rate
            </p>
            <Button
              variant="link"
              className="p-0 h-auto mt-2 text-xs"
              onClick={() => navigate('/app/conversations')}
            >
              View conversations <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Leads Generated */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads This Month</CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-950 rounded-lg">
              <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.thisMonth?.leads || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics?.leads?.qualified || 0} qualified • {metrics?.leads?.total || 0} total
            </p>
            <Button
              variant="link"
              className="p-0 h-auto mt-2 text-xs"
              onClick={() => navigate('/app/leads')}
            >
              View all leads <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Revenue Impact */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Impact</CardTitle>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950 rounded-lg">
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(metrics?.revenueImpact || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {metrics?.leads?.total || 0} leads
            </p>
            <Button
              variant="link"
              className="p-0 h-auto mt-2 text-xs"
              onClick={() => navigate('/app/deals')}
            >
              View deals <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <AIInsightsCard />

      {/* Recent Activity - Two Column Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Calls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Calls</CardTitle>
                <CardDescription>Latest activity from your agents</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/app/calls')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {callsToday && callsToday.length > 0 ? (
              <div className="space-y-4">
                {callsToday.slice(0, 5).map((call) => (
                  <div
                    key={call._id}
                    className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
                  >
                    {/* Direction Indicator */}
                    <div className="flex-shrink-0 pt-1">
                      {call.direction === 'inbound' ? (
                        <div className="p-2 bg-green-100 dark:bg-green-950 rounded-lg">
                          <PhoneIncoming className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                      ) : (
                        <div className="p-2 bg-red-100 dark:bg-red-950 rounded-lg">
                          <PhoneOutgoing className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                      )}
                    </div>

                    {/* Call Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">
                            {call.callerName || 'Unknown'}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {formatPhoneNumber(call.phoneNumber || call.callerPhone)}
                          </p>
                        </div>
                        <Badge variant={call.status === 'completed' ? 'success' : 'secondary'}>
                          {call.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {call.agentId?.name || 'Unknown Agent'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(call.duration)}
                        </span>
                        <span>{new Date(call.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Phone className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
                <p className="text-muted-foreground">No calls today</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => navigate('/app/agent-library')}
                >
                  Set up your first agent
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
            <CardDescription>Key metrics this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Call Stats */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Calls</span>
                <span className="font-medium">{metrics?.thisMonth?.calls || 0}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((metrics?.thisMonth?.calls || 0) / 100 * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Success Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Success Rate</span>
                <span className="font-medium">{metrics?.calls?.successRate || 0}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${metrics?.calls?.successRate || 0}%` }}
                />
              </div>
            </div>

            {/* Qualified Leads */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Qualified Leads</span>
                <span className="font-medium">{metrics?.leads?.qualified || 0}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${metrics?.leads?.total ? Math.min((metrics.leads.qualified / metrics.leads.total) * 100, 100) : 0}%`
                  }}
                />
              </div>
            </div>

            {/* Average Call Duration */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Avg Call Duration</p>
                <p className="text-2xl font-bold">{formatDuration(metrics?.calls?.avgDuration || 0)}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>

            {/* Total Minutes */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Total Minutes</p>
                <p className="text-2xl font-bold">{Math.round((metrics?.calls?.totalDuration || 0) / 60)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
