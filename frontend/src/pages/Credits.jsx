import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { billingApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, TrendingUp, Star, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/utils/toast';

export default function Credits() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: packagesData } = useQuery({
    queryKey: ['credit-packages'],
    queryFn: () => billingApi.get('/credits/packages').then(res => res.data.data),
  });

  const { data: balance } = useQuery({
    queryKey: ['credit-balance'],
    queryFn: () => billingApi.get('/credits/balance').then(res => res.data.data),
  });

  const { data: costs } = useQuery({
    queryKey: ['credit-costs'],
    queryFn: () => billingApi.get('/credits/costs').then(res => res.data.data),
  });

  const purchaseMutation = useMutation({
    mutationFn: (packageId) => billingApi.post('/credits/purchase', { packageId }),
    onSuccess: () => {
      toast.success('Credits purchased successfully!');
      queryClient.invalidateQueries(['credit-balance']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to purchase credits');
    }
  });

  const packages = packagesData?.packages || {};

  const getIcon = (packageId) => {
    const icons = {
      starter: Zap,
      professional: TrendingUp,
      enterprise: Star,
      mega: Sparkles
    };
    return icons[packageId] || Zap;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Buy Credits
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pay only for what you use. No subscriptions, no monthly fees. Credits never expire.
          </p>
        </div>

        {/* Current Balance */}
        {balance && (
          <Card className="max-w-md mx-auto mb-12 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Your Balance</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-6xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {balance.credits.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-2">credits available</div>
              <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                <div>
                  <div className="text-muted-foreground">Total Used</div>
                  <div className="font-semibold">{balance.totalUsed.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total Purchased</div>
                  <div className="font-semibold">{balance.totalPurchased.toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Credit Packages */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto mb-16">
          {Object.entries(packages).map(([packageId, pkg]) => {
            const Icon = getIcon(packageId);
            return (
              <Card
                key={packageId}
                className={`relative transition-all duration-300 hover:shadow-lg ${
                  pkg.popular ? 'border-primary shadow-md scale-105' : ''
                }`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-blue-600">
                    Most Popular
                  </Badge>
                )}

                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <CardDescription className="min-h-[3rem]">{pkg.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Price */}
                  <div className="text-center">
                    <div className="text-5xl font-bold">{formatCurrency(pkg.price)}</div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {pkg.credits.toLocaleString()} credits
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${pkg.pricePerCredit.toFixed(4)} per credit
                    </div>
                    {pkg.savings && (
                      <Badge variant="outline" className="mt-2">
                        Save {pkg.savings}
                      </Badge>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    size="lg"
                    variant={pkg.popular ? 'default' : 'outline'}
                    onClick={() => navigate(`/checkout?package=${packageId}`)}
                  >
                    Buy Now
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Credit Usage Costs */}
        {costs && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Credit Costs</CardTitle>
              <CardDescription>
                Understand how credits are used for different actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(costs.costs).map(([action, cost]) => (
                  <div key={action} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium capitalize">{cost.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {cost.perMinute && `${cost.perMinute} credit/minute`}
                        {cost.perMessage && `${cost.perMessage} credits/message`}
                        {cost.perEmail && `${cost.perEmail} credits/email`}
                        {cost.perExecution && `${cost.perExecution} credits/execution`}
                        {cost.perInvite && `${cost.perInvite} credits/invite`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* FAQ/Benefits */}
        <div className="max-w-4xl mx-auto mt-16 text-center space-y-8">
          <h2 className="text-3xl font-bold">Why Credits?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">No Expiration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your credits never expire. Use them whenever you need them.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">No Monthly Fees</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Pay once, use anytime. No recurring subscriptions or commitments.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Better Value</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Larger packages offer up to 49% savings compared to smaller packs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
