export default function StepMMSMedia({ agentData, updateAgentData }) {
  return (
    <div className="p-4 pb-20">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Upload Media</h2>
          <p className="text-muted-foreground">Add image, PDF, or video</p>
        </div>
        <div className="p-8 border-2 border-dashed border-border rounded-lg text-center">
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg">
            Choose Media File
          </button>
          <p className="text-xs text-muted-foreground mt-3">JPG, PNG, PDF, GIF, MP4</p>
        </div>
      </div>
    </div>
  );
}
