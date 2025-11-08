import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const agentApi = {
  getAll: () => axios.get(`${API_URL}/api/agents`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  }),
};

const campaignApi = {
  create: (data) => axios.post(`${API_URL}/api/campaigns`, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  }),
  uploadContacts: (id, file) => {
    const formData = new FormData();
    formData.append('csv', file);
    return axios.post(`${API_URL}/api/campaigns/${id}/contacts/upload`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    });
  },
};

export default function CampaignNew() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    agentId: '',
    type: 'outbound',
    callsPerHour: 30,
    maxRetries: 3,
  });
  const [csvFile, setCsvFile] = useState(null);
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Upload Contacts, 3: Schedule
  const [createdCampaignId, setCreatedCampaignId] = useState(null);

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => agentApi.getAll().then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: campaignApi.create,
    onSuccess: (response) => {
      setCreatedCampaignId(response.data._id);
      setStep(2);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: ({ id, file }) => campaignApi.uploadContacts(id, file),
    onSuccess: () => {
      navigate(`/app/campaigns/${createdCampaignId}`);
    },
  });

  const handleSubmitBasicInfo = async (e) => {
    e.preventDefault();

    const campaignData = {
      name: formData.name,
      description: formData.description,
      agentId: formData.agentId,
      type: formData.type,
      settings: {
        maxRetries: formData.maxRetries,
        callsPerHour: formData.callsPerHour,
      }
    };

    await createMutation.mutateAsync(campaignData);
  };

  const handleUploadContacts = async (e) => {
    e.preventDefault();

    if (!csvFile) {
      alert('Please select a CSV file');
      return;
    }

    await uploadMutation.mutateAsync({
      id: createdCampaignId,
      file: csvFile
    });
  };

  const handleSkipUpload = () => {
    navigate(`/app/campaigns/${createdCampaignId}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app/campaigns')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Campaign</h1>
          <p className="text-muted-foreground mt-1">
            Set up a new batch calling campaign
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            1
          </div>
          <span className="hidden sm:inline">Basic Info</span>
        </div>
        <div className="w-12 h-0.5 bg-border" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            2
          </div>
          <span className="hidden sm:inline">Upload Contacts</span>
        </div>
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>
              Configure the basic settings for your campaign
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitBasicInfo} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  placeholder="Q1 2024 Lead Generation"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Calling warm leads from website inquiries"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent">Voice Agent</Label>
                <Select
                  value={formData.agentId}
                  onValueChange={(value) => setFormData({ ...formData, agentId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents?.map((agent) => (
                      <SelectItem key={agent._id} value={agent._id}>
                        {agent.name} ({agent.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="callsPerHour">Calls Per Hour</Label>
                  <Input
                    id="callsPerHour"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.callsPerHour}
                    onChange={(e) => setFormData({ ...formData, callsPerHour: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxRetries">Max Retry Attempts</Label>
                  <Input
                    id="maxRetries"
                    type="number"
                    min="0"
                    max="5"
                    value={formData.maxRetries}
                    onChange={(e) => setFormData({ ...formData, maxRetries: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate('/app/campaigns')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Continue to Upload'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Upload Contacts */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Contacts</CardTitle>
            <CardDescription>
              Upload a CSV file with your contact list (name, phone, email, company)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUploadContacts} className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="space-y-2">
                  <Label htmlFor="csv-upload" className="cursor-pointer">
                    <span className="text-primary hover:underline">Click to upload</span> or drag and drop
                  </Label>
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files[0])}
                    className="hidden"
                  />
                  <p className="text-sm text-muted-foreground">
                    CSV file with columns: name, phone, email, company
                  </p>
                  {csvFile && (
                    <p className="text-sm font-medium text-primary">
                      Selected: {csvFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">CSV Format Example:</h4>
                <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
{`name,phone,email,company
John Doe,+15551234567,john@example.com,Acme Inc
Jane Smith,+15559876543,jane@example.com,Tech Corp`}
                </pre>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleSkipUpload}>
                  Skip for Now
                </Button>
                <Button type="submit" disabled={!csvFile || uploadMutation.isPending}>
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload & Finish'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
