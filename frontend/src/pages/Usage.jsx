import { useQuery } from '@tanstack/react-query';
import { usageApi } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Phone,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Users,
  HelpCircle,
  Calendar
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function Usage() {
  const { data, isLoading } = useQuery({
    queryKey: ['currentUsage'],
    queryFn: () => usageApi.getCurrentUsage().then(res => res.data),
  });

  const { data: history } = useQuery({
    queryKey: ['usageHistory'],
    queryFn: () => usageApi.getUsageHistory({ limit: 6 }).then(res => res.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading usage data...</p>
      </div>
    );
  }

  const { usage, planLimits, user } = data || {};
  const minutesPercentage = Math.min((usage?.minutesUsed / usage?.minutesIncluded) * 100, 100);
  const agentsPercentage = Math.min((usage?.agentsCreated / usage?.agentsLimit) * 100, 100);
  const isOverage = usage?.minutesUsed > usage?.minutesIncluded;
  const isNearLimit = minutesPercentage >= 80 && !isOverage;

  const getAlertVariant = () => {
    if (isOverage) return 'destructive';
    if (isNearLimit) return 'warning';
    return 'default';
  };

  const getAlertMessage = () => {
    if (isOverage) {
      return `You've exceeded your plan limit by ${usage.minutesOverage} minutes. You'll be charged $${usage.overageCharge.toFixed(2)} for overages at $${planLimits.overageRate}/minute.`;
    }
    if (isNearLimit) {
      return `You're at ${minutesPercentage.toFixed(0)}% of your monthly limit. Overages will be charged at $${planLimits.overageRate}/minute.`;
    }
    return `You're using ${minutesPercentage.toFixed(0)}% of your monthly limit. All systems operating normally.`;
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Usage & Billing</h1>
          <p className="text-muted-foreground">Track your usage and manage your plan limits</p>
        </div>

        {/* Alert Banner */}
        {(isOverage || isNearLimit) && (
          <Alert variant={getAlertVariant()}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{getAlertMessage()}</AlertDescription>
          </Alert>
        )}

        {/* Current Month Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Call Minutes Used</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usage?.minutesUsed || 0}</div>
              <p className="text-xs text-muted-foreground">
                of {usage?.minutesIncluded || 0} included
              </p>
              <Progress value={minutesPercentage} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usage?.callCount || 0}</div>
              <p className="text-xs text-muted-foreground">
                Avg {usage?.callCount > 0 ? ((usage?.minutesUsed || 0) / usage.callCount).toFixed(1) : 0} min/call
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voice Agents</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usage?.agentsCreated || 0}</div>
              <p className="text-xs text-muted-foreground">
                of {usage?.agentsLimit === Infinity ? '∞' : usage?.agentsLimit || 0} allowed
              </p>
              {usage?.agentsLimit !== Infinity && (
                <Progress value={agentsPercentage} className="mt-2" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  Overage Charges
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">Additional charges for usage beyond your plan's included minutes at ${planLimits?.overageRate || 0}/minute.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(usage?.overageCharge || 0)}</div>
              <p className="text-xs text-muted-foreground">
                {usage?.minutesOverage || 0} overage minutes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Plan Details */}
        <Card>
          <CardHeader>
            <CardTitle>Current Plan: {user?.plan && <Badge className="ml-2 capitalize">{user.plan}</Badge>}</CardTitle>
            <CardDescription>Your subscription details and limits</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Monthly Price</span>
                <span className="text-sm">{formatCurrency(planLimits?.price || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Included Minutes</span>
                <span className="text-sm">{planLimits?.minutes || 0} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Voice Agents Limit</span>
                <span className="text-sm">{planLimits?.agents === Infinity ? 'Unlimited' : planLimits?.agents || 0}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overage Rate</span>
                <span className="text-sm">{formatCurrency(planLimits?.overageRate || 0)}/min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Month</span>
                <span className="text-sm">{usage?.month || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Est. Total This Month</span>
                <span className="text-sm font-bold">
                  {formatCurrency((planLimits?.price || 0) + (usage?.overageCharge || 0))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription>Platform costs and revenue details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Platform Costs</p>
                  <p className="text-xs text-muted-foreground">ElevenLabs + Twilio charges</p>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(usage?.platformCost || 0)}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Your Subscription</p>
                  <p className="text-xs text-muted-foreground">Base plan + overages</p>
                </div>
                <span className="text-sm font-semibold">
                  {formatCurrency((planLimits?.price || 0) + (usage?.overageCharge || 0))}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">Net Margin</p>
                  <p className="text-xs text-green-700 dark:text-green-300">Subscription - Platform costs</p>
                </div>
                <span className="text-sm font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(((planLimits?.price || 0) + (usage?.overageCharge || 0)) - (usage?.platformCost || 0))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage History */}
        {history && history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Usage History
              </CardTitle>
              <CardDescription>Last 6 months of usage data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.map((monthUsage) => (
                  <div key={monthUsage._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">{monthUsage.month}</p>
                        <Badge variant="outline" className="capitalize">{monthUsage.plan}</Badge>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>{monthUsage.minutesUsed} min used</span>
                        <span>{monthUsage.callCount} calls</span>
                        {monthUsage.minutesOverage > 0 && (
                          <span className="text-orange-600 dark:text-orange-400">
                            +{monthUsage.minutesOverage} overage
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatCurrency(monthUsage.totalRevenue || 0)}
                      </p>
                      {monthUsage.overageCharge > 0 && (
                        <p className="text-xs text-muted-foreground">
                          +{formatCurrency(monthUsage.overageCharge)} overage
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}
