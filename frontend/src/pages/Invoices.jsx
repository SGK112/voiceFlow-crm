import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, DollarSign, Download, Send, Eye, Edit, Copy, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { invoiceApi } from '@/services/invoiceApi';
import QuickBooksInvoiceBuilder from '@/components/QuickBooksInvoiceBuilder';
import { format } from 'date-fns';

export default function Invoices() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderType, setBuilderType] = useState('invoice');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  // Fetch invoices
  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ['invoices', filter],
    queryFn: () => invoiceApi.getInvoices({
      status: filter !== 'all' ? filter : undefined
    }).then(res => res.data)
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['invoice-stats'],
    queryFn: () => invoiceApi.getStats().then(res => res.data)
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (selectedInvoice) {
        return invoiceApi.updateInvoice(selectedInvoice._id, data);
      }
      return invoiceApi.createInvoice(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['invoices']);
      queryClient.invalidateQueries(['invoice-stats']);
      setShowBuilder(false);
      setSelectedInvoice(null);
      alert('Invoice saved successfully!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to save invoice');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => invoiceApi.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['invoices']);
      queryClient.invalidateQueries(['invoice-stats']);
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to delete invoice');
    }
  });

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: (id) => invoiceApi.duplicateInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['invoices']);
      alert('Invoice duplicated successfully!');
    }
  });

  const handleSave = (data, sendImmediately) => {
    saveMutation.mutate(data);
  };

  const handleNewInvoice = (type) => {
    setBuilderType(type);
    setSelectedInvoice(null);
    setShowBuilder(true);
  };

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
    setBuilderType(invoice.type);
    setShowBuilder(true);
  };

  const getStatusBadge = (status) => {
    const variants = {
      draft: 'secondary',
      sent: 'default',
      viewed: 'default',
      partial: 'warning',
      paid: 'success',
      overdue: 'destructive',
      cancelled: 'secondary',
      accepted: 'success',
      declined: 'destructive'
    };

    const icons = {
      draft: FileText,
      sent: Send,
      viewed: Eye,
      partial: Clock,
      paid: CheckCircle,
      overdue: AlertCircle,
      accepted: CheckCircle,
      declined: AlertCircle
    };

    const Icon = icons[status] || FileText;

    return (
      <Badge variant={variants[status] || 'default'} className="capitalize">
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const invoices = invoicesData?.invoices || [];

  if (showBuilder) {
    return (
      <QuickBooksInvoiceBuilder
        type={builderType}
        initialData={selectedInvoice}
        onSave={handleSave}
        onCancel={() => {
          setShowBuilder(false);
          setSelectedInvoice(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Invoices & Estimates</h1>
          <p className="text-muted-foreground mt-1">Create and manage invoices and estimates</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => handleNewInvoice('estimate')} className="flex-1 sm:flex-none">
            <Plus className="h-4 w-4 mr-2" />
            New Estimate
          </Button>
          <Button onClick={() => handleNewInvoice('invoice')} className="flex-1 sm:flex-none">
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="hidden sm:inline">Total Revenue</span>
              <span className="sm:hidden">Revenue</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              ${stats?.totalRevenue?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Paid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="hidden sm:inline">Paid</span>
              <span className="sm:hidden">Paid</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats?.paidInvoices || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Send className="h-4 w-4 text-orange-600" />
              <span className="hidden sm:inline">Pending</span>
              <span className="sm:hidden">Pending</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats?.pendingInvoices || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="hidden sm:inline">Overdue</span>
              <span className="sm:hidden">Overdue</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats?.overdueInvoices || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Action needed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'draft', 'sent', 'paid', 'overdue'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
            className="capitalize whitespace-nowrap"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices & Estimates</CardTitle>
          <CardDescription>Your latest financial documents</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No {filter === 'all' ? 'invoices' : filter + ' invoices'} yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first invoice or estimate to get started
              </p>
              <Button onClick={() => handleNewInvoice('invoice')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice._id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-4"
                >
                  {/* Left: Invoice Info */}
                  <div className="flex items-start gap-3 sm:gap-4 flex-1">
                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{invoice.invoiceNumber}</p>
                        <Badge variant="outline" className="text-xs">
                          {invoice.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {invoice.client.name}
                        {invoice.client.company && ` • ${invoice.client.company}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(invoice.issueDate), 'MMM d, yyyy')}
                        {invoice.dueDate && ` • Due ${format(new Date(invoice.dueDate), 'MMM d')}`}
                      </p>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-none text-left sm:text-right">
                      <p className="font-bold text-lg">${invoice.total.toLocaleString()}</p>
                      {getStatusBadge(invoice.status)}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(invoice)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => duplicateMutation.mutate(invoice._id)}
                        className="h-8 w-8"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {invoice.status === 'draft' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm('Delete this invoice?')) {
                              deleteMutation.mutate(invoice._id);
                            }
                          }}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
