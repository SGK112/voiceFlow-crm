import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { settingsApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MapPin, Phone, Briefcase, ChevronRight, CheckCircle } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [businessData, setBusinessData] = useState({
    companyName: '',
    industry: '',
    businessType: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'United States'
    },
    phone: '',
    website: ''
  });

  const updateBusinessProfile = useMutation({
    mutationFn: (data) => settingsApi.put('/business-profile', data),
    onSuccess: () => {
      // Mark onboarding as complete
      localStorage.setItem('onboardingComplete', 'true');
      // Navigate to dashboard
      navigate('/app/dashboard');
    },
    onError: (error) => {
      alert(`Failed to save profile: ${error.response?.data?.message || error.message}`);
    }
  });

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setBusinessData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setBusinessData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleNext = () => {
    if (currentStep === 0) {
      // Validate step 1
      if (!businessData.companyName || !businessData.industry) {
        alert('Please fill in all required fields');
        return;
      }
    }

    if (currentStep === 1) {
      // Validate step 2
      if (!businessData.address.city || !businessData.address.state) {
        alert('Please provide your business location');
        return;
      }
    }

    if (currentStep === 2) {
      // Final step - save and continue
      updateBusinessProfile.mutate(businessData);
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const handleSkip = () => {
    localStorage.setItem('onboardingComplete', 'true');
    navigate('/app/dashboard');
  };

  const steps = [
    {
      title: 'Tell us about your business',
      description: 'Help us customize your AI agents',
      icon: Building2,
      fields: (
        <>
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              value={businessData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="Acme Plumbing"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry *</Label>
            <select
              id="industry"
              className="w-full px-3 py-2 border rounded-md"
              value={businessData.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
              required
            >
              <option value="">Select industry</option>
              <option value="construction">Construction</option>
              <option value="plumbing">Plumbing</option>
              <option value="hvac">HVAC</option>
              <option value="electrical">Electrical</option>
              <option value="roofing">Roofing</option>
              <option value="landscaping">Landscaping</option>
              <option value="real_estate">Real Estate</option>
              <option value="healthcare">Healthcare</option>
              <option value="automotive">Automotive</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type</Label>
            <select
              id="businessType"
              className="w-full px-3 py-2 border rounded-md"
              value={businessData.businessType}
              onChange={(e) => handleChange('businessType', e.target.value)}
            >
              <option value="">Select type</option>
              <option value="sole_proprietor">Sole Proprietor</option>
              <option value="llc">LLC</option>
              <option value="corporation">Corporation</option>
              <option value="partnership">Partnership</option>
            </select>
          </div>
        </>
      )
    },
    {
      title: 'Where are you located?',
      description: 'We\'ll use this for your agent scripts',
      icon: MapPin,
      fields: (
        <>
          <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              value={businessData.address.street}
              onChange={(e) => handleChange('address.street', e.target.value)}
              placeholder="123 Main St"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={businessData.address.city}
                onChange={(e) => handleChange('address.city', e.target.value)}
                placeholder="Phoenix"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={businessData.address.state}
                onChange={(e) => handleChange('address.state', e.target.value)}
                placeholder="AZ"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip">ZIP Code</Label>
            <Input
              id="zip"
              value={businessData.address.zip}
              onChange={(e) => handleChange('address.zip', e.target.value)}
              placeholder="85001"
            />
          </div>
        </>
      )
    },
    {
      title: 'Contact information',
      description: 'How can customers reach you?',
      icon: Phone,
      fields: (
        <>
          <div className="space-y-2">
            <Label htmlFor="phone">Business Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={businessData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="(602) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={businessData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://www.yourcompany.com"
            />
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Why do we need this?
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Your AI agents will use this information to provide accurate, personalized responses to customers.
                  You can always update these details later in Settings.
                </p>
              </div>
            </div>
          </div>
        </>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-full">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
                <CardDescription>{currentStepData.description}</CardDescription>
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex gap-2 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <p className="text-sm text-muted-foreground mt-2">
            Step {currentStep + 1} of {steps.length}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStepData.fields}

          <div className="flex justify-between gap-4 pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
            >
              Skip for now
            </Button>

            <Button
              onClick={handleNext}
              disabled={updateBusinessProfile.isPending}
              className="gap-2"
            >
              {currentStep === steps.length - 1 ? (
                updateBusinessProfile.isPending ? 'Saving...' : 'Complete Setup'
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
