import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { billingApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, TrendingUp, Star, Sparkles, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function Pricing() {
  const navigate = useNavigate();

  const { data: packagesData } = useQuery({
    queryKey: ['credit-packages'],
    queryFn: () => billingApi.get('/credits/packages').then(res => res.data.data),
  });

  const { data: costs } = useQuery({
    queryKey: ['credit-costs'],
    queryFn: () => billingApi.get('/credits/costs').then(res => res.data.data),
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
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="outline">Pay As You Go</Badge>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Buy credits once, use them anytime. No subscriptions, no monthly fees, no surprises.
          </p>
        </div>

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
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* How Credits Work */}
        {costs && (
          <div className="max-w-4xl mx-auto mb-16">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-3xl">How Credits Work</CardTitle>
                <CardDescription>
                  Credits are deducted based on your usage. Here's what each action costs:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(costs.costs).map(([action, cost]) => (
                    <div key={action} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{cost.description}</div>
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
          </div>
        )}

        {/* Benefits Section */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Pay-As-You-Go?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-green-500/10 rounded-full w-fit">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <CardTitle>No Expiration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your credits never expire. Buy once and use them whenever you need them, whether that's tomorrow or next year.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-blue-500/10 rounded-full w-fit">
                  <Zap className="h-8 w-8 text-blue-500" />
                </div>
                <CardTitle>No Commitments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No monthly fees, no subscriptions, no contracts. Pay only for what you use with complete flexibility.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-purple-500/10 rounded-full w-fit">
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
                <CardTitle>Better Value</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Larger packages offer up to 49% savings. The more you buy, the more you save per credit.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-blue-600/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Start with 100 Free Credits</CardTitle>
              <CardDescription className="text-base">
                Sign up today and get 100 credits to try out all features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" onClick={() => navigate('/signup')} className="w-full md:w-auto">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
