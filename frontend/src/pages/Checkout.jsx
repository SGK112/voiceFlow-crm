import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, CreditCard, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/utils/toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ selectedPackage, packageData }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const purchaseMutation = useMutation({
    mutationFn: async (paymentMethodId) => {
      const response = await billingApi.post('/credits/purchase', {
        packageId: selectedPackage,
        paymentMethodId
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Credits purchased successfully!');
      queryClient.invalidateQueries(['credit-balance']);
      navigate('/credits?success=true');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to purchase credits');
      setIsProcessing(false);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Stripe has not loaded yet. Please try again.');
      return;
    }

    if (!name || !email) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          name,
          email
        }
      });

      if (error) {
        toast.error(error.message);
        setIsProcessing(false);
        return;
      }

      // Process payment
      await purchaseMutation.mutateAsync(paymentMethod.id);
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contact Information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <Separator />

      {/* Payment Information */}
      <div className="space-y-4">
        <Label>Card Information</Label>
        <div className="border rounded-md p-3 bg-background">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          <span>Your payment information is secure and encrypted</span>
        </div>
      </div>

      <Separator />

      {/* Order Summary */}
      <div className="space-y-4">
        <h3 className="font-semibold">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{packageData.name}</span>
            <span>{formatCurrency(packageData.price)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Credits</span>
            <span>{packageData.credits.toLocaleString()}</span>
          </div>
          {packageData.savings && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Savings</span>
              <span>{packageData.savings}</span>
            </div>
          )}
        </div>
        <Separator />
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>{formatCurrency(packageData.price)}</span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay {formatCurrency(packageData.price)}
          </>
        )}
      </Button>
    </form>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPackage = searchParams.get('package');

  const { data: packagesData, isLoading } = useQuery({
    queryKey: ['credit-packages'],
    queryFn: () => billingApi.get('/credits/packages').then(res => res.data.data),
  });

  const packageData = packagesData?.packages?.[selectedPackage];

  useEffect(() => {
    if (!selectedPackage) {
      navigate('/credits');
    }
  }, [selectedPackage, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Package Not Found</CardTitle>
            <CardDescription>The selected package does not exist.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/credits')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Packages
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/credits')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Packages
          </Button>
          <h1 className="text-4xl font-bold mb-2">Complete Your Purchase</h1>
          <p className="text-muted-foreground">
            Secure checkout powered by Stripe
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Package Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {packageData.name}
                {packageData.popular && (
                  <Badge className="bg-gradient-to-r from-primary to-blue-600">
                    Most Popular
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>{packageData.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Price */}
              <div>
                <div className="text-4xl font-bold">{formatCurrency(packageData.price)}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {packageData.credits.toLocaleString()} credits
                </div>
                <div className="text-xs text-muted-foreground">
                  ${packageData.pricePerCredit.toFixed(4)} per credit
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">What's included:</h4>
                {packageData.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Benefits */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">Benefits:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Credits never expire</li>
                  <li>• No monthly fees or commitments</li>
                  <li>• Use credits for any service</li>
                  <li>• Instant activation</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Enter your payment information below</CardDescription>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  selectedPackage={selectedPackage}
                  packageData={packageData}
                />
              </Elements>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center space-y-4">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>Powered by Stripe</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
            Your payment is processed securely by Stripe. We never store your card information.
            All credits are added to your account immediately upon successful payment.
          </p>
        </div>
      </div>
    </div>
  );
}
