import React, { forwardRef, useCallback, useState } from "react";

interface Node {
  id: string;
  text: string;
  x: number;
  y: number;
  isRoot: boolean;
  color?: string;
  expanded?: boolean;
  description?: string;
  size?: "small" | "medium" | "large";
  shape?:
    | "rectangle"
    | "circle"
    | "rounded"
    | "diamond"
    | "hexagon"
    | "octagon"
    | "triangle"
    | "oval";
  children?: string[];
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
  panPosition: { x: number; y: number };
  gameState: "start" | "playing" | "win";
  nodeColors: {
    root: string;
    child: string;
    selected: string;
  };
  theme: "dark" | "light";
  isMobile: boolean;
  onNodeClick: (nodeId: string) => void;
  onNodeContextMenu: (e: React.MouseEvent, nodeId: string) => void;
  onNodeDragStart: (
    e: React.MouseEvent | React.TouchEvent,
    nodeId: string
  ) => void;
  onNodeDragEnd: () => void;
  onEditNode: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onPanView: (dx: number, dy: number) => void;
}

const MindMapVisualization = forwardRef<
  SVGSVGElement,
  MindMapVisualizationProps
>(
  (
    {
      containerRef,
      nodes,
      edges,
      activeNode,
      draggedNode,
      zoomLevel,
      panPosition,
      nodeColors,
      theme,
      onNodeClick,
      onNodeContextMenu,
      onNodeDragStart,
      onNodeDragEnd,
      onEditNode,
      onPanView,
    },
    ref
  ) => {
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
      if (e.button === 0 && e.ctrlKey) {
        e.preventDefault();
        setIsPanning(true);
        setPanStart({ x: e.clientX, y: e.clientY });
        if (containerRef.current) {
          containerRef.current.style.cursor = "grabbing";
        }
      }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (isPanning) {
        const dx = e.clientX - panStart.x;
        const dy = e.clientY - panStart.y;
        onPanView(dx, dy);
        setPanStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      if (isPanning) {
        setIsPanning(false);
        if (containerRef.current) {
          containerRef.current.style.cursor = "default";
        }
      }
    };

    const getNodeSize = (node: Node) => {
      const baseSize = node.isRoot ? 120 : 100;
      const sizeMultiplier = {
        small: 0.8,
        medium: 1,
        large: 1.2,
      }[node.size || "medium"];
      return baseSize * sizeMultiplier;
    };

    const renderEdge = useCallback(
      (edge: Edge) => {
        const source = nodes.find((n) => n.id === edge.source);
        const target = nodes.find((n) => n.id === edge.target);

        if (!source || !target) return null;

        // Don't show edges to collapsed nodes
        if (target.expanded === false) return null;

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
            stroke={
              isDragging
                ? nodeColors.selected
                : theme === "dark"
                ? "#4B5563"
                : "#9CA3AF"
            }
            strokeWidth={isDragging ? 3 : 2}
            strokeDasharray={isDragging ? "5,5" : "none"}
          />
        );
      },
      [nodes, theme, nodeColors.selected, draggedNode]
    );

    const renderNode = useCallback(
      (node: Node) => {
        const isActive = node.id === activeNode;
        const isHovered = node.id === hoveredNode;
        const isCollapsed = node.expanded === false;
        const isDragged = draggedNode === node.id;

        const nodeSize = getNodeSize(node);
        const nodeColor =
          node.color || (node.isRoot ? nodeColors.root : nodeColors.child);

        const width = nodeSize;
        const height = nodeSize * 0.6;
        const centerX = width / 2;
        const centerY = height / 2;

        // Diamond points (centered properly)
        const diamondPoints = `
      ${centerX},${centerY - height / 2}
      ${centerX + width / 2},${centerY}
      ${centerX},${centerY + height / 2}
      ${centerX - width / 2},${centerY}
    `;

        // Hexagon points
        const hexagonPoints = `
      ${centerX - width / 3},${centerY - height / 2}
      ${centerX + width / 3},${centerY - height / 2}
      ${centerX + width / 2},${centerY}
      ${centerX + width / 3},${centerY + height / 2}
      ${centerX - width / 3},${centerY + height / 2}
      ${centerX - width / 2},${centerY}
    `;

        // Octagon points
        const octagonPoints = `
      ${centerX - width / 3},${centerY - height / 2}
      ${centerX + width / 3},${centerY - height / 2}
      ${centerX + width / 2},${centerY - height / 4}
      ${centerX + width / 2},${centerY + height / 4}
      ${centerX + width / 3},${centerY + height / 2}
      ${centerX - width / 3},${centerY + height / 2}
      ${centerX - width / 2},${centerY + height / 4}
      ${centerX - width / 2},${centerY - height / 4}
    `;

        // Triangle points
        const trianglePoints = `
      ${centerX},${centerY - height / 2}
      ${centerX + width / 2},${centerY + height / 2}
      ${centerX - width / 2},${centerY + height / 2}
    `;

        // Ellipse (using ellipse element instead of polygon)

        const renderShape = () => {
          const shapeProps = {
            fill: nodeColor,
            stroke: isActive
              ? nodeColors.selected
              : isHovered
              ? "#FFFFFF"
              : "transparent",
            strokeWidth: isActive ? 3 : isHovered ? 2 : 0,
            onClick: () => onNodeClick(node.id),
          };

          switch (node.shape) {
            case "circle":
              return (
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={width / 2}
                  {...shapeProps}
                />
              );

            case "rounded":
              return (
                <rect width={width} height={height} rx={12} {...shapeProps} />
              );

            case "diamond":
              return <polygon points={diamondPoints} {...shapeProps} />;

            case "hexagon":
              return <polygon points={hexagonPoints} {...shapeProps} />;

            case "octagon":
              return <polygon points={octagonPoints} {...shapeProps} />;

            case "triangle":
              return <polygon points={trianglePoints} {...shapeProps} />;

            case "oval":
              return (
                <ellipse
                  cx={centerX}
                  cy={centerY}
                  rx={width / 2}
                  ry={height / 2}
                  {...shapeProps}
                />
              );

            default: // rectangle
              return (
                <rect width={width} height={height} rx={8} {...shapeProps} />
              );
          }
        };

        return (
          <g
            key={node.id}
            transform={`translate(${node.x - width / 2}, ${
              node.y - height / 2
            })`}
            onMouseDown={(e) => onNodeDragStart(e, node.id)}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            onContextMenu={(e) => onNodeContextMenu(e, node.id)}
            style={{
              cursor: isDragged ? "grabbing" : "pointer",
              opacity: isCollapsed ? 0.7 : 1,
            }}
          >
            {/* Render the shape */}
            {renderShape()}

            {/* Node text */}
            <text
              x={centerX}
              y={centerY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#FFFFFF"
              fontSize={node.isRoot ? 14 : 12}
              fontWeight={node.isRoot ? "bold" : "normal"}
              className="select-none"
              style={{
                pointerEvents: "none",
                textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
              }}
            >
              {node.text.length > 15
                ? node.text.substring(0, 15) + "..."
                : node.text}
            </text>

            {/* Collapse indicator */}
            {isCollapsed && (
              <circle
                cx={width - 10}
                cy={10}
                r={6}
                fill="#F59E0B"
                stroke="#FFFFFF"
                strokeWidth="1"
              />
            )}

            {/* Edit button */}
            {isActive && (
              <g
                onClick={(e) => {
                  e.stopPropagation();
                  onEditNode(node.id);
                }}
                style={{ cursor: "pointer" }}
                className="hover:opacity-80 transition-opacity"
              >
                <circle
                  cx={width}
                  cy={height}
                  r={10}
                  fill={nodeColors.selected}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text
                  x={width}
                  y={height + 3}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize={10}
                  fontWeight="bold"
                  style={{ pointerEvents: "none" }}
                >
                  E
                </text>
              </g>
            )}

            {/* Hover tooltip */}
            {isHovered && node.description && (
              <g>
                <rect
                  x={width + 10}
                  y={centerY - 20}
                  width={150}
                  height={40}
                  rx={6}
                  fill={theme === "dark" ? "#1F2937" : "#FFFFFF"}
                  stroke={theme === "dark" ? "#374151" : "#D1D5DB"}
                  strokeWidth={1}
                  className="shadow-lg"
                />
                <text
                  x={width + 15}
                  y={centerY}
                  fill={theme === "dark" ? "#E5E7EB" : "#374151"}
                  fontSize={10}
                  fontWeight="500"
                >
                  {node.description.length > 30
                    ? node.description.substring(0, 30) + "..."
                    : node.description}
                </text>
              </g>
            )}

            {/* Children count badge */}
            {node.children && node.children.length > 0 && (
              <circle
                cx={width - 10}
                cy={height - 10}
                r={8}
                fill={theme === "dark" ? "#374151" : "#F3F4F6"}
                stroke={theme === "dark" ? "#4B5563" : "#D1D5DB"}
                strokeWidth="1"
              >
                <title>{node.children.length} children</title>
                <text
                  x={width - 10}
                  y={height - 6}
                  textAnchor="middle"
                  fill={theme === "dark" ? "#E5E7EB" : "#374151"}
                  fontSize={8}
                  fontWeight="bold"
                  style={{ pointerEvents: "none" }}
                >
                  {node.children.length}
                </text>
              </circle>
            )}
          </g>
        );
      },
      [
        activeNode,
        hoveredNode,
        draggedNode,
        theme,
        nodeColors,
        onNodeClick,
        onNodeContextMenu,
        onNodeDragStart,
        onEditNode,
      ]
    );

    return (
      <div
        className="flex-1 border rounded-lg overflow-hidden"
        style={{
          background: theme === "dark" ? "#111827" : "#F9FAFB",
          height: "600px",
        }}
      >
        <div
          ref={containerRef}
          className="relative w-full h-full overflow-auto"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isPanning ? "grabbing" : "default" }}
        >
          <svg
            ref={ref}
            width="1000"
            height="700"
            style={{
              transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
              transformOrigin: "0 0",
            }}
            onMouseUp={onNodeDragEnd}
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background grid */}
            <pattern
              id="grid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke={theme === "dark" ? "#374151" : "#E5E7EB"}
                strokeWidth="1"
              />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" opacity="0.3" />

            <g>
              {edges.map(renderEdge)}
              {nodes.map(renderNode)}
            </g>
          </svg>

          {/* Controls */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <div
              className={`px-3 py-2 rounded-lg ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } border ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div
                className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Zoom: {Math.round(zoomLevel * 100)}%
              </div>
            </div>
            <div
              className={`px-3 py-2 rounded-lg ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } border ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div
                className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Ctrl+Scroll to zoom | Ctrl+Drag to pan
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

MindMapVisualization.displayName = "MindMapVisualization";

export default MindMapVisualization;
