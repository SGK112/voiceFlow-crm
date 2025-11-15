import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, CreditCard, Activity, User, Settings as SettingsIcon, Shield } from 'lucide-react';
import BusinessProfileTab from '@/components/settings/BusinessProfileTab';
import BillingTab from '@/components/settings/BillingTab';
import UsageTab from '@/components/settings/UsageTab';
import AccountTab from '@/components/settings/AccountTab';
import MonitoringTab from '@/components/settings/MonitoringTab';
import { useAuth } from '@/context/AuthContext';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('account');
  const { user } = useAuth();

  // Check if user is admin (only help.remodely@gmail.com for now)
  const isAdmin = user?.email === 'help.remodely@gmail.com';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-blue-600" />
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account, business profile, billing, and usage
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'} bg-white dark:bg-gray-800 border border-gray-200 p-1 rounded-lg`}>
          <TabsTrigger value="account" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="business" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Business</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="usage" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Usage</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin" className="gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="account">
          <AccountTab />
        </TabsContent>

        <TabsContent value="business">
          <BusinessProfileTab />
        </TabsContent>

        <TabsContent value="billing">
          <BillingTab />
        </TabsContent>

        <TabsContent value="usage">
          <UsageTab />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin">
            <MonitoringTab />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
