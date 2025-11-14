import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Send, Calendar, DollarSign, User, Mail, Phone, Building2, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { leadApi } from '@/services/api';

export default function QuickBooksInvoiceBuilder({ type = 'invoice', initialData, onSave, onCancel }) {
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

  // Calculate totals
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
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      <div className="min-h-screen">
        {/* QuickBooks-Style Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                  <DollarSign className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {type === 'estimate' ? 'New Estimate' : 'New Invoice'}
                  </h1>
                  <p className="text-sm text-gray-500">Create and send to your customer</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSave(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save draft
                </button>
                <button
                  onClick={() => handleSave(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Save and send
                </button>
                <button
                  onClick={onCancel}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Invoice Header Section */}
            <div className="p-8 border-b border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Customer Info */}
                <div>
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Bill To
                  </h2>

                  {/* Quick Select */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      Select from existing customers
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      onChange={(e) => selectLead(e.target.value)}
                      value={invoice.lead || ''}
                    >
                      <option value="">Choose a customer or add new below</option>
                      {leads?.map(lead => (
                        <option key={lead._id} value={lead._id}>
                          {lead.name} {lead.company && `(${lead.company})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Customer Details */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Customer name *
                      </label>
                      <input
                        type="text"
                        value={invoice.client.name}
                        onChange={(e) => setInvoice({ ...invoice, client: { ...invoice.client, name: e.target.value }})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter customer name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Company
                      </label>
                      <input
                        type="text"
                        value={invoice.client.company}
                        onChange={(e) => setInvoice({ ...invoice, client: { ...invoice.client, company: e.target.value }})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Company name (optional)"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          Email
                        </label>
                        <input
                          type="email"
                          value={invoice.client.email}
                          onChange={(e) => setInvoice({ ...invoice, client: { ...invoice.client, email: e.target.value }})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="email@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={invoice.client.phone}
                          onChange={(e) => setInvoice({ ...invoice, client: { ...invoice.client, phone: e.target.value }})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="(555) 000-0000"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Invoice Details */}
                <div>
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {type === 'estimate' ? 'Estimate' : 'Invoice'} Details
                  </h2>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          {type === 'estimate' ? 'Estimate date' : 'Invoice date'}
                        </label>
                        <input
                          type="date"
                          value={invoice.issueDate}
                          onChange={(e) => setInvoice({ ...invoice, issueDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          {type === 'estimate' ? 'Valid until' : 'Due date'}
                        </label>
                        <input
                          type="date"
                          value={type === 'estimate' ? invoice.validUntil : invoice.dueDate}
                          onChange={(e) => setInvoice({
                            ...invoice,
                            [type === 'estimate' ? 'validUntil' : 'dueDate']: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">Status</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {invoice.status === 'draft' ? 'Draft' : 'Sent'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Items
                </h2>
                <button
                  onClick={addItem}
                  className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  Add line
                </button>
              </div>

              {/* Table Header */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide pb-3 pr-4" style={{width: '40%'}}>
                        Description
                      </th>
                      <th className="text-right text-xs font-semibold text-gray-600 uppercase tracking-wide pb-3 px-2" style={{width: '12%'}}>
                        Qty
                      </th>
                      <th className="text-right text-xs font-semibold text-gray-600 uppercase tracking-wide pb-3 px-2" style={{width: '15%'}}>
                        Rate
                      </th>
                      <th className="text-right text-xs font-semibold text-gray-600 uppercase tracking-wide pb-3 px-2" style={{width: '15%'}}>
                        Amount
                      </th>
                      <th className="text-center text-xs font-semibold text-gray-600 uppercase tracking-wide pb-3 px-2" style={{width: '10%'}}>
                        Tax
                      </th>
                      <th className="pb-3 pl-2" style={{width: '8%'}}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 pr-4">
                          <input
                            type="text"
                            placeholder="Enter description"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm text-right focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.rate}
                              onChange={(e) => updateItem(index, 'rate', e.target.value)}
                              className="w-full pl-5 pr-2 py-1.5 border border-gray-200 rounded text-sm text-right focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="text-right font-medium text-gray-900 text-sm px-2 py-1.5">
                            ${item.amount.toFixed(2)}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <input
                            type="checkbox"
                            checked={item.taxable}
                            onChange={(e) => updateItem(index, 'taxable', e.target.checked)}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                        </td>
                        <td className="py-3 pl-2 text-right">
                          {invoice.items.length > 1 && (
                            <button
                              onClick={() => removeItem(index)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Section */}
            <div className="px-8 pb-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Notes */}
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message to customer
                    </label>
                    <textarea
                      value={invoice.notes}
                      onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                      rows={3}
                      placeholder="Thank you for your business..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Terms and conditions
                    </label>
                    <textarea
                      value={invoice.terms}
                      onChange={(e) => setInvoice({ ...invoice, terms: e.target.value })}
                      rows={3}
                      placeholder="Payment terms..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                {/* Right: Totals */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                    Summary
                  </h3>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-900">${invoice.subtotal?.toFixed(2) || '0.00'}</span>
                    </div>

                    {/* Tax Rate Input */}
                    <div className="flex items-center justify-between text-sm border-t border-gray-200 pt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Tax</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={invoice.taxRate}
                          onChange={(e) => setInvoice({ ...invoice, taxRate: parseFloat(e.target.value) || 0 })}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-xs text-right"
                          placeholder="0"
                        />
                        <span className="text-gray-500 text-xs">%</span>
                      </div>
                      <span className="font-medium text-gray-900">${invoice.taxAmount?.toFixed(2) || '0.00'}</span>
                    </div>

                    {/* Discount Input */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Discount</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={invoice.discount}
                          onChange={(e) => setInvoice({ ...invoice, discount: parseFloat(e.target.value) || 0 })}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-xs text-right"
                          placeholder="0"
                        />
                        <select
                          value={invoice.discountType}
                          onChange={(e) => setInvoice({ ...invoice, discountType: e.target.value })}
                          className="px-2 py-1 border border-gray-300 rounded text-xs"
                        >
                          <option value="fixed">$</option>
                          <option value="percentage">%</option>
                        </select>
                      </div>
                      <span className="font-medium text-green-600">
                        -${invoice.discountType === 'percentage'
                          ? ((invoice.subtotal * invoice.discount) / 100).toFixed(2)
                          : (invoice.discount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t-2 border-gray-300 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-green-600">
                        ${invoice.total?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
