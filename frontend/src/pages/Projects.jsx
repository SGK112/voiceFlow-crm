import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Building2, Calendar, DollarSign, Users, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Link } from 'react-router-dom';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, [filterStatus]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const response = await api.get('/projects', { params });
      setProjects(response.data);
    } catch (error) {
      toast.error('Failed to load projects');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/projects/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'secondary', icon: Clock },
      in_progress: { label: 'In Progress', variant: 'default', icon: Building2 },
      on_hold: { label: 'On Hold', variant: 'warning', icon: AlertCircle },
      completed: { label: 'Completed', variant: 'success', icon: CheckCircle2 },
      cancelled: { label: 'Cancelled', variant: 'destructive', icon: AlertCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getProjectTypeLabel = (type) => {
    const types = {
      kitchen: 'Kitchen',
      bathroom: 'Bathroom',
      basement: 'Basement',
      addition: 'Addition',
      exterior: 'Exterior',
      roofing: 'Roofing',
      flooring: 'Flooring',
      custom: 'Custom',
      other: 'Other'
    };
    return types[type] || type;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.leadId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-500',
      in_progress: 'bg-blue-500',
      on_hold: 'bg-yellow-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage your remodeling projects and track progress
          </p>
        </div>
        <Link to="/app/projects/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          {stats.byStatus.map((stat) => (
            <Card key={stat._id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">
                  {stat._id.replace('_', ' ')}
                </CardTitle>
                <div className={`w-2 h-2 rounded-full ${getStatusColor(stat._id)}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.count}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stat.totalEstimate)} estimated
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search projects or customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('all')}
          >
            All
          </Button>
          <Button
            variant={filterStatus === 'in_progress' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('in_progress')}
          >
            Active
          </Button>
          <Button
            variant={filterStatus === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('completed')}
          >
            Completed
          </Button>
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-muted-foreground">Loading projects...</div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm
                ? 'Try adjusting your search'
                : 'Get started by creating your first project'}
            </p>
            <Link to="/app/projects/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredProjects.map((project) => (
            <Link key={project._id} to={`/app/projects/${project._id}`}>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{project.name}</h3>
                        {getStatusBadge(project.status)}
                        <Badge variant="outline">
                          {getProjectTypeLabel(project.projectType)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">
                        {project.leadId?.name || 'No customer assigned'}
                      </p>
                      {project.address?.street && (
                        <p className="text-sm text-muted-foreground">
                          {project.address.street}, {project.address.city}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {formatCurrency(project.estimate?.total)}
                      </div>
                      <p className="text-sm text-muted-foreground">Estimated</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Start Date</p>
                        <p className="text-sm font-medium">{formatDate(project.startDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">End Date</p>
                        <p className="text-sm font-medium">
                          {formatDate(project.estimatedEndDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Team</p>
                        <p className="text-sm font-medium">
                          {project.teamMembers?.length || 0} members
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Milestones</p>
                        <p className="text-sm font-medium">
                          {project.milestones?.filter(m => m.completed).length || 0} / {project.milestones?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
