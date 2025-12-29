import React, { forwardRef, useCallback } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent } from "@/components/ui/card";

interface Node {
  id: string;
  text: string;
  x: number;
  y: number;
  isRoot: boolean;
  color?: string;
}

interface Edge {
  id: string;
  source: string;
  target: string;
}

interface MindMapVisualizationProps {
  containerRef: React.RefObject<HTMLDivElement>;
  nodes: Node[];
  edges: Edge[];
  activeNode: string | null;
  draggedNode: string | null;
  zoomLevel: number;
  gameState: "start" | "playing" | "win";
  nodeColors: {
    root: string;
    child: string;
    selected: string;
  };
  isMobile: boolean;
  onNodeClick: (nodeId: string) => void;
  onNodeDragStart: (e: React.MouseEvent | React.TouchEvent, nodeId: string) => void;
  onNodeDragEnd: () => void;
  onEditNode: (nodeId: string) => void;
}

const MindMapVisualization = forwardRef<SVGSVGElement, MindMapVisualizationProps>(
  (
    {
      containerRef,
      nodes,
      edges,
      activeNode,
      draggedNode,
      zoomLevel,
      gameState,
      nodeColors,
      isMobile,
      onNodeClick,
      onNodeDragStart,
      onNodeDragEnd,
      onEditNode,
    },
    ref
  ) => {
    const theme = {
      background: "#0F172A",
      cardBackground: "#1E293B",
      sidebarBackground: "#1E293B",
      text: "#E2E8F0",
      node: nodeColors.child,
      nodeStroke: "#334155",
      edge: "#475569",
      suggestion: "#2D3748",
      accent: "#F05A5B",
      success: "#34D399",
      warning: "#FBBF24",
    };

    const renderEdge = useCallback(
      (edge: Edge) => {
        const source = nodes.find((n) => n.id === edge.source);
        const target = nodes.find((n) => n.id === edge.target);

        if (!source || !target) return null;

        const isDragging =
          draggedNode &&
          (edge.source === draggedNode || edge.target === draggedNode);

        return (
          <line
            key={edge.id}
            x1={source.x}
            y1={source.y}
            x2={target.x}
            y2={target.y}
            stroke={isDragging ? nodeColors.selected : theme.edge}
            strokeWidth={isDragging ? 3 : 2}
            className="transition-all duration-200"
          />
        );
      },
      [nodes, theme.edge, nodeColors.selected, draggedNode]
    );

    const renderNode = useCallback(
      (node: Node) => {
        const isActive = node.id === activeNode;
        const nodeSize = isMobile
          ? node.isRoot
            ? 80
            : 70
          : node.isRoot
          ? 120
          : 100;
        const nodeColor =
          node.color || (node.isRoot ? nodeColors.root : nodeColors.child);

        return (
          <g
            key={node.id}
            transform={`translate(${node.x - nodeSize / 2}, ${
              node.y - nodeSize / 3
            })`}
            onMouseDown={(e) => onNodeDragStart(e, node.id)}
            onTouchStart={(e) => onNodeDragStart(e, node.id)}
            style={{ cursor: draggedNode === node.id ? "grabbing" : "grab" }}
            className="transition-transform duration-200"
          >
            <rect
              width={nodeSize}
              height={nodeSize * 0.6}
              rx={8}
              fill={nodeColor}
              stroke={isActive ? nodeColors.selected : theme.nodeStroke}
              strokeWidth={isActive ? 3 : 2}
              className="shadow-lg"
              style={{
                filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))",
                transition: "all 0.2s ease",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onNodeClick(node.id);
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                onNodeClick(node.id);
              }}
            />
            <text
              x={nodeSize / 2}
              y={nodeSize * 0.35}
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize={isMobile ? (node.isRoot ? 10 : 9) : node.isRoot ? 14 : 13}
              fontWeight={node.isRoot ? "bold" : "600"}
              className="pointer-events-none select-none"
              style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
            >
              {node.text.length > 20
                ? node.text.substring(0, 20) + "..."
                : node.text}
            </text>
            {isActive && (
              <g
                onClick={(e) => {
                  e.stopPropagation();
                  onEditNode(node.id);
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  onEditNode(node.id);
                }}
                style={{ cursor: "pointer" }}
                className="hover:opacity-80 transition-opacity"
              >
                <circle
                  cx={nodeSize}
                  cy={nodeSize * 0.6}
                  r={isMobile ? 6 : 8}
                  fill={nodeColors.selected}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text
                  x={nodeSize}
                  y={nodeSize * 0.6 + 2}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize={isMobile ? 8 : 10}
                  fontWeight="bold"
                  style={{ pointerEvents: "none" }}
                >
                  E
                </text>
              </g>
            )}
          </g>
        );
      },
      [
        activeNode,
        theme.nodeStroke,
        nodeColors,
        onNodeClick,
        onNodeDragStart,
        onEditNode,
        draggedNode,
        isMobile,
      ]
    );

    return (
      <Card className="border-gray-700 bg-gray-800 shadow-xl flex-1 overflow-hidden">
        <CardContent className="p-1 sm:p-2 md:p-0 h-full">
          <AspectRatio ratio={16 / 9} className="w-full h-full">
            <div
              ref={containerRef}
              className="relative w-full h-full overflow-hidden rounded-lg bg-gray-900"
            >
              <svg
                ref={ref}
                width="100%"
                height="100%"
                viewBox="0 0 800 600"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: "center",
                  transition: "transform 0.2s ease",
                }}
                onMouseUp={onNodeDragEnd}
                onMouseLeave={onNodeDragEnd}
                onTouchEnd={onNodeDragEnd}
                onClick={() => {
                  // Clear selection when clicking on empty space
                  // Note: This is handled in parent component
                }}
              >
                <defs>
                  <filter
                    id="glow"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                  >
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <g>
                  {edges.map(renderEdge)}
                  {nodes.map(renderNode)}
                </g>
              </svg>

              {/* Zoom Indicator */}
              {zoomLevel !== 1 && (
                <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-gray-800/90 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg shadow-lg">
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    Zoom: {Math.round(zoomLevel * 100)}%
                  </div>
                </div>
              )}

              {/* Instruction Tooltip */}
              {gameState === "playing" && (
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-gray-800/90 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-2 rounded-lg shadow-lg">
                  <div className="text-xs text-gray-300">
                    <div className="flex items-center gap-1 mb-1">
                      <div className="w-2 h-2 rounded-full bg-[#F05A5B]"></div>
                      <span>Click nodes to select</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: nodeColors.selected }}
                      ></div>
                      <span>Drag nodes to move</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AspectRatio>
        </CardContent>
      </Card>
    );
  }
);

MindMapVisualization.displayName = "MindMapVisualization";

export default MindMapVisualization;