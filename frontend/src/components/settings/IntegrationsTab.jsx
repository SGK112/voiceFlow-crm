import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export default function IntegrationsTab() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
        <CardDescription>Connect your favorite tools and services</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Manage your integrations with QuickBooks, Google Calendar, Slack, and more.
        </p>
        <Button onClick={() => navigate('/app/integrations')} className="gap-2">
          Go to Integrations Page
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
