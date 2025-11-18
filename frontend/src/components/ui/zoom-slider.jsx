import { useReactFlow } from "reactflow";
import { Plus, Minus } from "lucide-react";
import { useEffect, useState } from "react";

const positionClasses = {
  "top-left": "top-4 left-4",
  "top-right": "top-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-right": "bottom-4 right-4",
};

export function ZoomSlider({
  position = "top-left",
  orientation = "horizontal",
  className = ""
}) {
  const { zoomIn, zoomOut, setViewport, getViewport } = useReactFlow();
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const viewport = getViewport();
    setZoom(viewport.zoom || 1);
  }, [getViewport]);

  const handleZoomChange = (e) => {
    const newZoom = parseFloat(e.target.value);
    const viewport = getViewport();
    setViewport({
      x: viewport.x,
      y: viewport.y,
      zoom: newZoom
    });
    setZoom(newZoom);
  };

  const isHorizontal = orientation === "horizontal";

  return (
    <div
      className={`absolute ${positionClasses[position]} bg-card/90 backdrop-blur-sm border border-border/50 shadow-sm rounded-md p-2 ${className}`}
      style={{ zIndex: 1000 }}
    >
      <div className={`flex ${isHorizontal ? 'flex-row items-center' : 'flex-col items-center'} gap-2`}>
        <button
          onClick={() => {
            zoomOut();
            const viewport = getViewport();
            setZoom(viewport.zoom);
          }}
          className="p-1 hover:bg-muted rounded transition-colors"
          title="Zoom out"
        >
          <Minus className="h-3 w-3" />
        </button>

        <input
          type="range"
          value={zoom}
          onChange={handleZoomChange}
          min={0.5}
          max={2}
          step={0.1}
          className={`${isHorizontal ? 'w-16' : 'h-16 rotate-270'} accent-primary cursor-pointer`}
          style={isHorizontal ? {} : { writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical' }}
        />

        <button
          onClick={() => {
            zoomIn();
            const viewport = getViewport();
            setZoom(viewport.zoom);
          }}
          className="p-1 hover:bg-muted rounded transition-colors"
          title="Zoom in"
        >
          <Plus className="h-3 w-3" />
        </button>

        <div className="text-xs text-muted-foreground ml-1">
          {Math.round(zoom * 100)}%
        </div>
      </div>
    </div>
  );
}
