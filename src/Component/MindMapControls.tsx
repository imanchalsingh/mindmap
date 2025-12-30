import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

interface MindMapControlsProps {
  gameState: "start" | "playing" | "win";
  showInstructions: boolean;
  customNodeText: string;
  setCustomNodeText: (text: string) => void;
  zoomLevel: number;
  setZoomLevel: (level: number) => void;
  nodes: Array<{
    id: string;
    text: string;
    expanded?: boolean;
    children?: string[];
    parent?: string;
  }>;
  edges: Array<{ id: string; source: string; target: string }>;
  activeNode: string | null;
  colorPalette: string[];
  nodeColors: {
    root: string;
    child: string;
    selected: string;
  };
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onStartMindMap: () => void;
  onAddCustomNode: (text: string) => void;
  onAddNodeFromSuggestion: (text: string) => void;
  onUpdateColorScheme: (
    type: "root" | "child" | "selected",
    color: string
  ) => void;
  onExportAsImage: () => void;
  onExportAsJSON: () => void;
  onImportFromJSON: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onResetMindMap: () => void;
  onFinishMindMap: () => void;
  onToggleNodeExpand: (nodeId: string) => void;
  onDrillDown: (nodeId: string) => void;
  onDrillUp: () => void;
  onFitView: () => void;
}

const MindMapControls: React.FC<MindMapControlsProps> = ({
  gameState,
  customNodeText,
  setCustomNodeText,
  zoomLevel,
  setZoomLevel,
  nodes,
  edges,
  activeNode,
  colorPalette,
  theme,
  onToggleTheme,
  onStartMindMap,
  onAddCustomNode,
  onUpdateColorScheme,
  onExportAsImage,
  onExportAsJSON,
  onImportFromJSON,
  onResetMindMap,
  onFinishMindMap,
  onToggleNodeExpand,
  onDrillDown,
  onDrillUp,
  onFitView,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6 w-80 flex-shrink-0">
      <div
        className={`rounded-lg border p-4 ${
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            className={`font-semibold ${
              theme === "dark" ? "text-gray-200" : "text-gray-800"
            }`}
          >
            Controls
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleTheme}
            className={
              theme === "dark"
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-500 hover:text-gray-800"
            }
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </Button>
        </div>

        {gameState === "start" && (
          <div className="space-y-4">
            <Button
              className="w-full bg-gradient-to-r from-[#F05A5B] to-[#BF4E30] hover:from-[#E04A4B] hover:to-[#AF3E20] text-white"
              onClick={onStartMindMap}
            >
              Start Mind Mapping
            </Button>
          </div>
        )}

        {gameState === "playing" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                className={theme === "dark" ? "text-gray-300" : "text-gray-700"}
              >
                Add Custom Node
              </Label>
              <div className="flex gap-2">
                <Input
                  value={customNodeText}
                  onChange={(e) => setCustomNodeText(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && onAddCustomNode(customNodeText)
                  }
                  className={
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-200"
                      : ""
                  }
                  placeholder="Enter idea..."
                  disabled={!activeNode}
                />
                <Button
                  onClick={() => onAddCustomNode(customNodeText)}
                  disabled={!activeNode || !customNodeText.trim()}
                  className="bg-gradient-to-r from-[#F05A5B] to-[#BF4E30] hover:from-[#E04A4B] hover:to-[#AF3E20] text-white"
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                className={theme === "dark" ? "text-gray-300" : "text-gray-700"}
              >
                Zoom: {Math.round(zoomLevel * 100)}%
              </Label>
              <Slider
                value={[zoomLevel]}
                min={0.3}
                max={3}
                step={0.1}
                onValueChange={([value]) => setZoomLevel(value)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>30%</span>
                <span>100%</span>
                <span>300%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={onFitView}
                className={
                  theme === "dark"
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : ""
                }
              >
                Fit View
              </Button>
              <Button
                variant="outline"
                onClick={() => activeNode && onToggleNodeExpand(activeNode)}
                disabled={!activeNode}
                className={
                  theme === "dark"
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : ""
                }
              >
                {nodes.find((n) => n.id === activeNode)?.expanded
                  ? "Collapse"
                  : "Expand"}
              </Button>
              <Button
                variant="outline"
                onClick={() => activeNode && onDrillDown(activeNode)}
                disabled={
                  !activeNode ||
                  !nodes.find((n) => n.id === activeNode)?.children?.length
                }
                className={
                  theme === "dark"
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : ""
                }
              >
                Drill Down
              </Button>
              <Button
                variant="outline"
                onClick={onDrillUp}
                disabled={
                  !activeNode || !nodes.find((n) => n.id === activeNode)?.parent
                }
                className={
                  theme === "dark"
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : ""
                }
              >
                Drill Up
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div
                className={`p-3 rounded text-center ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <div className="text-xl font-bold text-[#F05A5B]">
                  {nodes.length}
                </div>
                <div
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Nodes
                </div>
              </div>
              <div
                className={`p-3 rounded text-center ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <div className="text-xl font-bold text-[#4A90E2]">
                  {edges.length}
                </div>
                <div
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Edges
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={onImportFromJSON}
                className="hidden"
              />
              <Button
                variant="outline"
                className={`w-full ${
                  theme === "dark"
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : ""
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                Import JSON
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className={
                    theme === "dark"
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : ""
                  }
                  onClick={onExportAsImage}
                >
                  Export PNG
                </Button>
                <Button
                  variant="outline"
                  className={
                    theme === "dark"
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : ""
                  }
                  onClick={onExportAsJSON}
                >
                  Export JSON
                </Button>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-[#F05A5B] to-[#BF4E30] hover:from-[#E04A4B] hover:to-[#AF3E20] text-white"
                onClick={onFinishMindMap}
              >
                Finish Mind Map
              </Button>

              <Button
                variant="destructive"
                className="w-full"
                onClick={onResetMindMap}
              >
                Reset
              </Button>
            </div>
          </div>
        )}

        {gameState === "win" && (
          <div className="space-y-4">
            <div
              className={`p-4 rounded ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <h4
                className={`font-semibold mb-2 ${
                  theme === "dark" ? "text-gray-200" : "text-gray-800"
                }`}
              >
                Mind Map Complete!
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span
                    className={
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }
                  >
                    Nodes:
                  </span>
                  <Badge>{nodes.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span
                    className={
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }
                  >
                    Edges:
                  </span>
                  <Badge>{edges.length}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className={
                  theme === "dark"
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : ""
                }
                onClick={onExportAsImage}
              >
                Export PNG
              </Button>
              <Button
                variant="outline"
                className={
                  theme === "dark"
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : ""
                }
                onClick={onExportAsJSON}
              >
                Export JSON
              </Button>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-[#F05A5B] to-[#BF4E30] hover:from-[#E04A4B] hover:to-[#AF3E20] text-white"
              onClick={onResetMindMap}
            >
              New Mind Map
            </Button>
          </div>
        )}
      </div>

      {/* Color Picker */}
      <div
        className={`rounded-lg border p-4 ${
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <h3
          className={`font-semibold mb-3 ${
            theme === "dark" ? "text-gray-200" : "text-gray-800"
          }`}
        >
          Colors
        </h3>
        <div className="space-y-4">
          <div>
            <Label
              className={`text-sm ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Root Nodes
            </Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {colorPalette.slice(0, 6).map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: color }}
                  onClick={() => onUpdateColorScheme("root", color)}
                />
              ))}
            </div>
          </div>
          <div>
            <Label
              className={`text-sm ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Child Nodes
            </Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {colorPalette.slice(6, 12).map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: color }}
                  onClick={() => onUpdateColorScheme("child", color)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MindMapControls;
