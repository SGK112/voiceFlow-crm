import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { subscriptionApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, HelpCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function Pricing() {
  const navigate = useNavigate();

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: () => subscriptionApi.getPlans().then(res => res.data),
  });

  const getOverageTooltip = (planName) => {
    const overageRates = {
      trial: 'Trial plan does not allow overages. Upgrade to continue using the service.',
      starter: 'Additional minutes are charged at $0.60 per minute after your monthly limit.',
      professional: 'Additional minutes are charged at $0.50 per minute after your monthly limit.',
      enterprise: 'Additional minutes are charged at $0.40 per minute after your monthly limit.'
    };
    return overageRates[planName] || '';
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-lg text-muted-foreground">
              Select the perfect plan for your business needs
            </p>
          </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {plans?.map((plan) => (
            <Card key={plan._id} className="relative">
              {plan.name === 'professional' && (
                <Badge className="absolute top-4 right-4">Popular</Badge>
              )}
              <CardHeader>
                <CardTitle className="text-2xl capitalize">{plan.displayName}</CardTitle>
                <CardDescription>
                  <span className="text-4xl font-bold">{formatCurrency(plan.price)}</span>
                  <span className="text-muted-foreground">/month</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{plan.callLimit} calls/month</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold mb-1">What happens if I go over?</p>
                        <p className="text-sm">{getOverageTooltip(plan.name)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                      {feature.includes('API access') && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-sm">Create API keys to integrate VoiceFlow CRM with your own applications and workflows.</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {feature.includes('Team members') && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-sm">Invite team members to collaborate on voice agents, manage leads, and view analytics together.</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {feature.includes('Advanced analytics') && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-sm">Get detailed insights into call performance, conversion rates, and customer interactions with advanced reporting.</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {feature.includes('Priority support') && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-sm">Get faster response times and dedicated support from our team to help you succeed.</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {feature.includes('Custom integrations') && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-sm">Connect with your existing tools and services through custom integrations tailored to your workflow.</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  ))}
                </div>
                <Button className="w-full" onClick={() => navigate('/signup')}>
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
