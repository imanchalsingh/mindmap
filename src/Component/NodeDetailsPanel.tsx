import React from "react";
import { Button } from "@/components/ui/button";

interface NodeDetailsPanelProps {
  node: {
    id: string;
    text: string;
    description?: string;
    color?: string;
    children?: string[];
    parent?: string;
    expanded?: boolean;
    data?: {
      priority?: "low" | "medium" | "high";
      status?: "active" | "completed" | "in-progress" | "planned";
      created?: string;
    };
    size?: "small" | "medium" | "large";
    shape?: "rectangle" | "circle" | "rounded" | "diamond" | "hexagon" | "octagon" | "triangle" | "oval";
    isRoot?: boolean;
  };
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleExpand: () => void;
  onDrillDown: () => void;
  onDrillUp?: () => void;
  theme: "dark" | "light";
}

const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({
  node,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleExpand,
  onDrillDown,
  onDrillUp,
  theme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="w-80 flex-shrink-0">
      <div
        className={`rounded-lg border ${
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } p-4 h-full`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            className={`font-semibold ${
              theme === "dark" ? "text-gray-200" : "text-gray-800"
            }`}
          >
            Node Details
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className={
              theme === "dark"
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-500 hover:text-gray-800"
            }
          >
            ✕
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <div
              className={`text-sm font-medium mb-1 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Text
            </div>
            <div
              className={`p-2 rounded ${
                theme === "dark"
                  ? "bg-gray-700 text-gray-200"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {node.text}
            </div>
          </div>

          <div>
            <div
              className={`text-sm font-medium mb-1 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Description
            </div>
            <div
              className={`p-2 rounded ${
                theme === "dark"
                  ? "bg-gray-700 text-gray-200"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {node.description || "No description"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div
                className={`text-sm font-medium mb-1 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Size
              </div>
              <div
                className={`p-2 rounded text-center ${
                  theme === "dark"
                    ? "bg-gray-700 text-gray-200"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {node.size || "Medium"}
              </div>
            </div>
            <div>
              <div
                className={`text-sm font-medium mb-1 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Shape
              </div>
              <div
                className={`p-2 rounded text-center ${
                  theme === "dark"
                    ? "bg-gray-700 text-gray-200"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {node.shape || "Rectangle"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div
              className={`p-3 rounded text-center ${
                theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
              }`}
            >
              <div className="text-xl font-bold text-[#F05A5B]">
                {node.children?.length || 0}
              </div>
              <div
                className={`text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Children
              </div>
            </div>
            <div
              className={`p-3 rounded text-center ${
                theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
              }`}
            >
              <div
                className={`text-xl font-bold ${
                  theme === "dark" ? "text-[#4A90E2]" : "text-[#4A90E2]"
                }`}
              >
                {node.expanded ? "Expanded" : "Collapsed"}
              </div>
              <div
                className={`text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                State
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              className="w-full bg-gradient-to-r from-[#F05A5B] to-[#BF4E30] hover:from-[#E04A4B] hover:to-[#AF3E20] text-white"
              onClick={onEdit}
            >
              Edit Node
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className={
                  theme === "dark"
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                }
                onClick={onToggleExpand}
              >
                {node.expanded ? "Collapse" : "Expand"}
              </Button>
              <Button
                variant="outline"
                className={
                  theme === "dark"
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                }
                onClick={onDrillDown}
                disabled={!node.children || node.children.length === 0}
              >
                Drill Down
              </Button>
            </div>

            {onDrillUp && (
              <Button
                variant="outline"
                className={`w-full ${
                  theme === "dark"
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
                onClick={onDrillUp}
              >
                Drill Up
              </Button>
            )}

            {!node.isRoot && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={onDelete}
              >
                Delete Node
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeDetailsPanel;
