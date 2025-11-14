import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import businessProfileApi from '@/services/businessProfileApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Building2, MapPin, Phone, Mail, Globe, FileText, Upload, X,
  Plus, Trash2, Users, DollarSign, CheckCircle2, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BusinessProfileTab() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [priceSheetFile, setPriceSheetFile] = useState(null);

  // Fetch business profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['businessProfile'],
    queryFn: () => businessProfileApi.getProfile().then(res => res.data)
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: (data) => businessProfileApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['businessProfile']);
      setIsEditing(false);
      alert('Profile updated successfully!');
    },
    onError: (error) => {
      alert('Failed to update profile: ' + (error.response?.data?.message || error.message));
    }
  });

  // Upload logo mutation
  const uploadLogoMutation = useMutation({
    mutationFn: (file) => businessProfileApi.uploadLogo(file),
    onSuccess: () => {
      queryClient.invalidateQueries(['businessProfile']);
      setLogoFile(null);
      alert('Logo uploaded successfully!');
    }
  });

  // Upload price sheet mutation
  const uploadPriceSheetMutation = useMutation({
    mutationFn: (file) => businessProfileApi.uploadPriceSheet(file),
    onSuccess: () => {
      queryClient.invalidateQueries(['businessProfile']);
      setPriceSheetFile(null);
      alert('Price sheet uploaded successfully!');
    }
  });

  // Delete price sheet mutation
  const deletePriceSheetMutation = useMutation({
    mutationFn: (sheetId) => businessProfileApi.deletePriceSheet(sheetId),
    onSuccess: () => {
      queryClient.invalidateQueries(['businessProfile']);
    }
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        companyName: profile.companyName || '',
        legalName: profile.legalName || '',
        phone: profile.phone || '',
        email: profile.email || '',
        website: profile.website || '',
        taxId: profile.taxId || '',
        address: profile.address || {},
        serviceArea: profile.serviceArea || { type: 'radius', radiusMiles: 25 },
        industry: profile.industry || '',
        businessType: profile.businessType || '',
        yearsInBusiness: profile.yearsInBusiness || '',
        numberOfEmployees: profile.numberOfEmployees || 1,
        procedures: profile.procedures || {}
      });
    }
  }, [profile]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  const handleServiceAreaChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      serviceArea: { ...prev.serviceArea, [field]: value }
    }));
  };

  const handleProceduresChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      procedures: { ...prev.procedures, [field]: value }
    }));
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadLogoMutation.mutate(file);
    }
  };

  const handlePriceSheetUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadPriceSheetMutation.mutate(file);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  const completionPercent = profile?.completionStatus?.percentComplete || 0;

  return (
    <div className="space-y-6">
      {/* Completion Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Profile Completion</span>
            <Badge variant={completionPercent === 100 ? 'default' : 'secondary'}>
              {completionPercent}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              <div className="flex items-center gap-1">
                {profile?.completionStatus?.basicInfo ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span>Basic Info</span>
              </div>
              <div className="flex items-center gap-1">
                {profile?.completionStatus?.address ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span>Address</span>
              </div>
              <div className="flex items-center gap-1">
                {profile?.completionStatus?.serviceArea ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span>Service Area</span>
              </div>
              <div className="flex items-center gap-1">
                {profile?.completionStatus?.procedures ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span>Procedures</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Company Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>Basic details about your business</CardDescription>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              value={formData.companyName || ''}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              disabled={!isEditing}
              placeholder="Your Company LLC"
              className="text-base"
            />
          </div>

          {/* Legal Name */}
          <div className="space-y-2">
            <Label htmlFor="legalName">Legal Name</Label>
            <Input
              id="legalName"
              value={formData.legalName || ''}
              onChange={(e) => handleInputChange('legalName', e.target.value)}
              disabled={!isEditing}
              placeholder="Your Company Legal Name LLC"
              className="text-base"
            />
          </div>

          {/* Contact Info - Mobile-first two column layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Phone *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
                placeholder="(555) 123-4567"
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
                placeholder="info@company.com"
                className="text-base"
              />
            </div>
          </div>

          {/* Website & Tax ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Website
              </Label>
              <Input
                id="website"
                type="url"
                value={formData.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                disabled={!isEditing}
                placeholder="https://yourcompany.com"
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Tax ID (EIN)
              </Label>
              <Input
                id="taxId"
                value={formData.taxId || ''}
                onChange={(e) => handleInputChange('taxId', e.target.value)}
                disabled={!isEditing}
                placeholder="12-3456789"
                className="text-base"
              />
            </div>
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label>Company Logo</Label>
            {profile?.logo && (
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={profile.logo}
                  alt="Company logo"
                  className="h-12 w-12 object-contain border rounded"
                />
                <span className="text-sm text-muted-foreground">Current logo</span>
              </div>
            )}
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploadLogoMutation.isPending}
                className="text-base"
              />
            </div>
            <p className="text-xs text-muted-foreground">Upload a square logo (PNG or JPG, max 10MB)</p>
          </div>

          {isEditing && (
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={updateMutation.isPending} className="flex-1 h-11">
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    companyName: profile.companyName || '',
                    legalName: profile.legalName || '',
                    phone: profile.phone || '',
                    email: profile.email || '',
                    website: profile.website || '',
                    taxId: profile.taxId || '',
                    address: profile.address || {},
                    serviceArea: profile.serviceArea || {},
                    industry: profile.industry || '',
                    businessType: profile.businessType || '',
                    yearsInBusiness: profile.yearsInBusiness || '',
                    numberOfEmployees: profile.numberOfEmployees || 1,
                    procedures: profile.procedures || {}
                  });
                }}
                variant="outline"
                className="flex-1 h-11"
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Business Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Business Address
          </CardTitle>
          <CardDescription>Your primary business location</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              value={formData.address?.street || ''}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              disabled={!isEditing}
              placeholder="123 Main Street"
              className="text-base"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.address?.city || ''}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                disabled={!isEditing}
                placeholder="Phoenix"
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.address?.state || ''}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                disabled={!isEditing}
                placeholder="AZ"
                maxLength={2}
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip">ZIP</Label>
              <Input
                id="zip"
                value={formData.address?.zip || ''}
                onChange={(e) => handleAddressChange('zip', e.target.value)}
                disabled={!isEditing}
                placeholder="85001"
                className="text-base"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Area - Mobile-first simple approach */}
      <Card>
        <CardHeader>
          <CardTitle>Service Area</CardTitle>
          <CardDescription>Where do you provide services?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Service Radius</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((miles) => (
                <Button
                  key={miles}
                  variant={formData.serviceArea?.radiusMiles === miles ? 'default' : 'outline'}
                  onClick={() => handleServiceAreaChange('radiusMiles', miles)}
                  disabled={!isEditing}
                  className="h-12"
                >
                  {miles} mi
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Current: {formData.serviceArea?.radiusMiles || 25} miles from your business address
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
          <CardDescription>Tell us about your business</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <select
                id="industry"
                value={formData.industry || ''}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                disabled={!isEditing}
                className="w-full h-11 rounded-md border border-input bg-background px-3 text-base"
              >
                <option value="">Select industry</option>
                <option value="general-contractor">General Contractor</option>
                <option value="remodeling">Remodeling</option>
                <option value="carpentry">Carpentry</option>
                <option value="hvac">HVAC</option>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="flooring">Flooring</option>
                <option value="roofing">Roofing</option>
                <option value="painting">Painting</option>
                <option value="landscaping">Landscaping</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <select
                id="businessType"
                value={formData.businessType || ''}
                onChange={(e) => handleInputChange('businessType', e.target.value)}
                disabled={!isEditing}
                className="w-full h-11 rounded-md border border-input bg-background px-3 text-base"
              >
                <option value="">Select type</option>
                <option value="contractor">Contractor</option>
                <option value="subcontractor">Subcontractor</option>
                <option value="supplier">Supplier</option>
                <option value="consultant">Consultant</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yearsInBusiness">Years in Business</Label>
              <Input
                id="yearsInBusiness"
                type="number"
                min="0"
                value={formData.yearsInBusiness || ''}
                onChange={(e) => handleInputChange('yearsInBusiness', parseInt(e.target.value))}
                disabled={!isEditing}
                placeholder="5"
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfEmployees">Number of Employees</Label>
              <Input
                id="numberOfEmployees"
                type="number"
                min="1"
                value={formData.numberOfEmployees || ''}
                onChange={(e) => handleInputChange('numberOfEmployees', parseInt(e.target.value))}
                disabled={!isEditing}
                placeholder="10"
                className="text-base"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Procedures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing & Procedures
          </CardTitle>
          <CardDescription>Default settings for quotes and payments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default Markup/Margin</Label>
            <div className="grid grid-cols-4 gap-2">
              {[0.25, 0.30, 0.35, 0.40].map((margin) => (
                <Button
                  key={margin}
                  variant={formData.procedures?.defaultMargin === margin ? 'default' : 'outline'}
                  onClick={() => handleProceduresChange('defaultMargin', margin)}
                  disabled={!isEditing}
                  className="h-12"
                >
                  {(margin * 100).toFixed(0)}%
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentTerms">Payment Terms</Label>
            <select
              id="paymentTerms"
              value={formData.procedures?.paymentTerms || 'net-30'}
              onChange={(e) => handleProceduresChange('paymentTerms', e.target.value)}
              disabled={!isEditing}
              className="w-full h-11 rounded-md border border-input bg-background px-3 text-base"
            >
              <option value="due-on-receipt">Due on Receipt</option>
              <option value="net-15">Net 15</option>
              <option value="net-30">Net 30</option>
              <option value="net-60">Net 60</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="warrantyPeriodMonths">Warranty Period (Months)</Label>
            <Input
              id="warrantyPeriodMonths"
              type="number"
              min="0"
              value={formData.procedures?.warrantyPeriodMonths || 12}
              onChange={(e) => handleProceduresChange('warrantyPeriodMonths', parseInt(e.target.value))}
              disabled={!isEditing}
              className="text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Price Sheets */}
      <Card>
        <CardHeader>
          <CardTitle>Price Sheets</CardTitle>
          <CardDescription>Upload your pricing catalogs and sheets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.priceSheets && profile.priceSheets.length > 0 && (
            <div className="space-y-2">
              {profile.priceSheets.map((sheet) => (
                <div
                  key={sheet._id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{sheet.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {sheet.fileType?.toUpperCase()} • {(sheet.fileSize / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePriceSheetMutation.mutate(sheet._id)}
                    disabled={deletePriceSheetMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Input
              type="file"
              accept=".pdf,.csv,.xlsx,.xls"
              onChange={handlePriceSheetUpload}
              disabled={uploadPriceSheetMutation.isPending}
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              Upload PDF, CSV, or Excel files (max 10MB)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
