import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export default function UsageTab() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage & Analytics</CardTitle>
        <CardDescription>View your API usage, call history, and analytics</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Track your API calls, voice minutes, and agent activity.
        </p>
        <Button onClick={() => navigate('/app/usage')} className="gap-2">
          Go to Usage Page
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
