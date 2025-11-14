import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Trash2, Save, Send, Calculator } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { leadApi } from '@/services/api';

export default function InvoiceBuilder({ type = 'invoice', initialData, onSave, onCancel }) {
  const [invoice, setInvoice] = useState({
    type,
    status: 'draft',
    client: {
      name: '',
      email: '',
      phone: '',
      company: '',
      address: {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'USA'
      }
    },
    items: [
      { description: '', quantity: 1, rate: 0, amount: 0, taxable: true }
    ],
    taxRate: 0,
    discount: 0,
    discountType: 'fixed',
    notes: '',
    terms: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    validUntil: type === 'estimate' ? '' : undefined,
    ...initialData
  });

  const { data: leads } = useQuery({
    queryKey: ['leads'],
    queryFn: () => leadApi.getLeads().then(res => res.data.leads || [])
  });

  // Calculate totals whenever items, tax, or discount change
  useEffect(() => {
    const subtotal = invoice.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxableAmount = invoice.items
      .filter(item => item.taxable)
      .reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxAmount = (taxableAmount * invoice.taxRate) / 100;

    let discountAmount = 0;
    if (invoice.discountType === 'percentage') {
      discountAmount = (subtotal * invoice.discount) / 100;
    } else {
      discountAmount = invoice.discount || 0;
    }

    const total = subtotal + taxAmount - discountAmount;

    setInvoice(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      total
    }));
  }, [invoice.items, invoice.taxRate, invoice.discount, invoice.discountType]);

  const updateItem = (index, field, value) => {
    const newItems = [...invoice.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-calculate amount when quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : newItems[index].quantity;
      const rate = field === 'rate' ? parseFloat(value) || 0 : newItems[index].rate;
      newItems[index].amount = quantity * rate;
    }

    setInvoice({ ...invoice, items: newItems });
  };

  const addItem = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { description: '', quantity: 1, rate: 0, amount: 0, taxable: true }]
    });
  };

  const removeItem = (index) => {
    if (invoice.items.length > 1) {
      setInvoice({
        ...invoice,
        items: invoice.items.filter((_, i) => i !== index)
      });
    }
  };

  const selectLead = (leadId) => {
    const lead = leads?.find(l => l._id === leadId);
    if (lead) {
      setInvoice({
        ...invoice,
        lead: leadId,
        client: {
          name: lead.name,
          email: lead.email || '',
          phone: lead.phone || '',
          company: lead.company || '',
          address: lead.address || {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: 'USA'
          }
        }
      });
    }
  };

  const handleSave = (sendImmediately = false) => {
    const dataToSave = {
      ...invoice,
      status: sendImmediately ? 'sent' : invoice.status
    };
    onSave(dataToSave, sendImmediately);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 md:p-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {type === 'estimate' ? 'New Estimate' : 'New Invoice'}
            </h1>
            <p className="text-muted-foreground">Create a professional {type} for your client</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Client Selection */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Select from Leads */}
            <div>
              <label className="block text-sm font-medium mb-1">Quick Select from Leads</label>
              <select
                className="w-full border border-input rounded-lg px-3 py-2 bg-background"
                onChange={(e) => selectLead(e.target.value)}
                value={invoice.lead || ''}
              >
                <option value="">Select a lead (or enter manually below)</option>
                {leads?.map(lead => (
                  <option key={lead._id} value={lead._id}>
                    {lead.name} {lead.company && `- ${lead.company}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Manual Client Entry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Client Name *</label>
                <input
                  type="text"
                  value={invoice.client.name}
                  onChange={(e) => setInvoice({ ...invoice, client: { ...invoice.client, name: e.target.value }})}
                  className="w-full border border-input rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
                <input
                  type="text"
                  value={invoice.client.company}
                  onChange={(e) => setInvoice({ ...invoice, client: { ...invoice.client, company: e.target.value }})}
                  className="w-full border border-input rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={invoice.client.email}
                  onChange={(e) => setInvoice({ ...invoice, client: { ...invoice.client, email: e.target.value }})}
                  className="w-full border border-input rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={invoice.client.phone}
                  onChange={(e) => setInvoice({ ...invoice, client: { ...invoice.client, phone: e.target.value }})}
                  className="w-full border border-input rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Items</CardTitle>
              <Button onClick={addItem} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoice.items.map((item, index) => (
                <div key={index} className="border rounded-lg p-3 md:p-4 bg-muted/30">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <input
                        type="text"
                        placeholder="Description (e.g., Kitchen Remodel - Labor)"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="flex-1 border border-input rounded-lg px-3 py-2 text-sm md:text-base"
                      />
                      {invoice.items.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          className="flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-medium mb-1">Qty</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className="w-full border border-input rounded-lg px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Rate ($)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => updateItem(index, 'rate', e.target.value)}
                          className="w-full border border-input rounded-lg px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Amount</label>
                        <input
                          type="text"
                          value={`$${item.amount.toFixed(2)}`}
                          readOnly
                          className="w-full border border-input rounded-lg px-2 py-1.5 text-sm bg-muted font-semibold"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={item.taxable}
                        onChange={(e) => updateItem(index, 'taxable', e.target.checked)}
                        className="rounded"
                      />
                      <span>Taxable</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Calculations */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Calculations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tax */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={invoice.taxRate}
                  onChange={(e) => setInvoice({ ...invoice, taxRate: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-input rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Discount</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={invoice.discount}
                    onChange={(e) => setInvoice({ ...invoice, discount: parseFloat(e.target.value) || 0 })}
                    className="flex-1 border border-input rounded-lg px-3 py-2"
                  />
                  <select
                    value={invoice.discountType}
                    onChange={(e) => setInvoice({ ...invoice, discountType: e.target.value })}
                    className="border border-input rounded-lg px-3 py-2"
                  >
                    <option value="fixed">$</option>
                    <option value="percentage">%</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span className="font-semibold">${invoice.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              {invoice.taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Tax ({invoice.taxRate}%):</span>
                  <span className="font-semibold">${invoice.taxAmount?.toFixed(2) || '0.00'}</span>
                </div>
              )}
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount:</span>
                  <span className="font-semibold">
                    -${invoice.discountType === 'percentage'
                      ? ((invoice.subtotal * invoice.discount) / 100).toFixed(2)
                      : invoice.discount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>${invoice.total?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dates & Notes */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {type === 'estimate' ? 'Estimate Date' : 'Issue Date'}
                </label>
                <input
                  type="date"
                  value={invoice.issueDate}
                  onChange={(e) => setInvoice({ ...invoice, issueDate: e.target.value })}
                  className="w-full border border-input rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {type === 'estimate' ? 'Valid Until' : 'Due Date'}
                </label>
                <input
                  type="date"
                  value={type === 'estimate' ? invoice.validUntil : invoice.dueDate}
                  onChange={(e) => setInvoice({
                    ...invoice,
                    [type === 'estimate' ? 'validUntil' : 'dueDate']: e.target.value
                  })}
                  className="w-full border border-input rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes (visible to client)</label>
              <textarea
                value={invoice.notes}
                onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                rows={3}
                placeholder="Thank you for your business!"
                className="w-full border border-input rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Terms & Conditions</label>
              <textarea
                value={invoice.terms}
                onChange={(e) => setInvoice({ ...invoice, terms: e.target.value })}
                rows={3}
                placeholder="Payment due within 30 days..."
                className="w-full border border-input rounded-lg px-3 py-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Bottom Action Bar (Mobile-Friendly) */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg p-4">
        <div className="max-w-4xl mx-auto flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => handleSave(false)}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave(true)}>
            <Send className="h-4 w-4 mr-2" />
            Save & Send
          </Button>
        </div>
      </div>
    </div>
  );
}
