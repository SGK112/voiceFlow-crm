import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Loader, Eye, Check, X } from 'lucide-react';
import api from '../services/api';

export default function ExcelUpload({ onSuccess, onClose }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (selectedFile) => {
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

    if (!validTypes.includes(selectedFile.type)) {
      alert('Please upload an Excel (.xlsx, .xls) or CSV file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const uploadAndParse = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/leads/upload-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setParseResult(response.data);
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || 'Failed to parse Excel file');
    } finally {
      setUploading(false);
    }
  };

  const confirmImport = async () => {
    if (!parseResult?.leads) return;

    setImporting(true);
    try {
      // Use the existing import endpoint with the parsed leads
      await api.post('/leads/import', {
        leads: parseResult.leads.map(lead => ({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          address: lead.address,
          city: lead.city,
          state: lead.state,
          zip: lead.zip,
          notes: lead.notes,
          source: lead.source || 'excel-import',
          value: lead.value,
          status: lead.stage || 'new'
        }))
      });

      alert(`Successfully imported ${parseResult.leads.length} leads!`);
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error('Import error:', error);
      alert(error.response?.data?.message || 'Failed to import leads');
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setParseResult(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-foreground">AI-Powered Excel Import</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!file && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                  : 'border-border bg-secondary/50'
              }`}
            >
              <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Drop your Excel file here, or click to browse
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Supports .xlsx, .xls, and .csv files up to 10MB
              </p>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                Choose File
              </label>

              <div className="mt-8 text-left bg-background border border-border rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">How it works:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• AI automatically detects and maps your columns</li>
                  <li>• Cleans and validates email addresses and phone numbers</li>
                  <li>• Handles missing or incomplete data gracefully</li>
                  <li>• Preview and review before importing</li>
                </ul>
              </div>
            </div>
          )}

          {file && !parseResult && (
            <div className="bg-secondary border border-border rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <FileSpreadsheet className="w-10 h-10 text-blue-600" />
                <div className="flex-1">
                  <div className="font-medium text-foreground">{file.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={uploadAndParse}
                  disabled={uploading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Processing with AI...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Parse & Preview
                    </>
                  )}
                </button>
                <button
                  onClick={reset}
                  disabled={uploading}
                  className="px-4 py-2 border border-border text-muted-foreground hover:bg-secondary rounded-lg disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {parseResult && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900 dark:text-green-100">Successful</span>
                  </div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {parseResult.stats.successfulRows}
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium text-red-900 dark:text-red-100">Failed</span>
                  </div>
                  <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                    {parseResult.stats.failedRows}
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Rows</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {parseResult.stats.totalRows}
                  </div>
                </div>
              </div>

              {/* Mapping Info */}
              {parseResult.mapping?.suggestions && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">AI Mapping Results</h4>
                  </div>

                  {parseResult.mapping.suggestions.missingFields?.length > 0 && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Missing fields: </span>
                      <span className="text-sm text-blue-700 dark:text-blue-300">
                        {parseResult.mapping.suggestions.missingFields.join(', ')}
                      </span>
                    </div>
                  )}

                  {parseResult.mapping.suggestions.recommendations?.length > 0 && (
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      {parseResult.mapping.suggestions.recommendations.map((rec, i) => (
                        <li key={i}>• {rec}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Errors */}
              {parseResult.stats.errors?.length > 0 && (
                <div className="bg-secondary border border-border rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-3">Errors ({parseResult.stats.errors.length})</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {parseResult.stats.errors.slice(0, 10).map((error, i) => (
                      <div key={i} className="text-sm bg-background border border-border rounded p-2">
                        <span className="font-medium text-red-600">Row {error.row}:</span>{' '}
                        <span className="text-muted-foreground">{error.reason}</span>
                      </div>
                    ))}
                    {parseResult.stats.errors.length > 10 && (
                      <div className="text-sm text-muted-foreground italic">
                        ... and {parseResult.stats.errors.length - 10} more errors
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Preview */}
              <div className="bg-secondary border border-border rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-3">Preview (First 5 leads)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-background border-b border-border">
                      <tr>
                        <th className="text-left p-2 text-muted-foreground font-medium">Name</th>
                        <th className="text-left p-2 text-muted-foreground font-medium">Email</th>
                        <th className="text-left p-2 text-muted-foreground font-medium">Phone</th>
                        <th className="text-left p-2 text-muted-foreground font-medium">Company</th>
                        <th className="text-left p-2 text-muted-foreground font-medium">Stage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parseResult.leads.slice(0, 5).map((lead, i) => (
                        <tr key={i} className="border-b border-border">
                          <td className="p-2 text-foreground">{lead.name}</td>
                          <td className="p-2 text-muted-foreground">{lead.email}</td>
                          <td className="p-2 text-muted-foreground">{lead.phone}</td>
                          <td className="p-2 text-muted-foreground">{lead.company || '-'}</td>
                          <td className="p-2 text-muted-foreground">{lead.stage || 'new'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parseResult.leads.length > 5 && (
                  <div className="text-sm text-muted-foreground mt-2 italic">
                    ... and {parseResult.leads.length - 5} more leads
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  onClick={confirmImport}
                  disabled={importing || parseResult.leads.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {importing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Import {parseResult.leads.length} Leads
                    </>
                  )}
                </button>
                <button
                  onClick={reset}
                  disabled={importing}
                  className="px-6 py-3 border border-border text-muted-foreground hover:bg-secondary rounded-lg disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
