import { FileText, Upload, X } from 'lucide-react';

export default function StepKnowledgeBase({ agentData, updateAgentData }) {
  return (
    <div className="p-4 pb-20">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Knowledge Base</h2>
          <p className="text-muted-foreground">Add documents or context (optional)</p>
        </div>

        <div className="p-8 border-2 border-dashed border-border rounded-lg text-center bg-muted/20">
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium mb-2">Upload Documents</p>
          <p className="text-sm text-muted-foreground mb-4">PDF, TXT, CSV, DOCX</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Choose Files
          </button>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            💡 Skip this step if your agent doesn't need specific documents
          </p>
        </div>
      </div>
    </div>
  );
}
