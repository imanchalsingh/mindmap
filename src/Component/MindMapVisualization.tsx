import React, {
  forwardRef,
  useCallback,
  useState,
  useRef,
  useEffect,
} from "react";

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
  onZoomChange: (zoom: number) => void;
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
      isMobile,
      onNodeClick,
      onNodeContextMenu,
      onNodeDragStart,
      onNodeDragEnd,
      onEditNode,
      onPanView,
      onZoomChange,
    },
    ref
  ) => {
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [touchStart, setTouchStart] = useState<{
      x: number;
      y: number;
      distance: number;
    } | null>(null);
    const [containerSize, setContainerSize] = useState({
      width: 1000,
      height: 700,
    });
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    // Handle container resize for responsiveness
    useEffect(() => {
      if (!containerRef.current) return;

      const updateSize = () => {
        if (containerRef.current) {
          const { width, height } =
            containerRef.current.getBoundingClientRect();
          setContainerSize({
            width: Math.max(width, 1000),
            height: Math.max(height, 700),
          });
        }
      };

      // Initial size
      updateSize();

      // Create ResizeObserver
      resizeObserverRef.current = new ResizeObserver(updateSize);
      resizeObserverRef.current.observe(containerRef.current);

      return () => {
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
        }
      };
    }, [containerRef]);

    // Mouse event handlers
    const handleMouseDown = (e: React.MouseEvent) => {
      // Left click + Ctrl or Middle click for panning
      if ((e.button === 0 && (e.ctrlKey || e.metaKey)) || e.button === 1) {
        e.preventDefault();
        startPanning(e.clientX, e.clientY);
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
        stopPanning();
      }
    };

    // Touch event handlers
    const handleTouchStart = (e: React.TouchEvent) => {
      e.preventDefault();

      if (e.touches.length === 1) {
        // Single touch - start panning or dragging
        const touch = e.touches[0];
        setPanStart({ x: touch.clientX, y: touch.clientY });

        // Check if we touched a node (this would be handled by node's touchStart)
        // If not on a node, start panning
        setIsPanning(true);
        if (containerRef.current) {
          containerRef.current.style.cursor = "grabbing";
        }
      } else if (e.touches.length === 2) {
        // Two touches - prepare for pinch zoom
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        setTouchStart({
          x: (touch1.clientX + touch2.clientX) / 2,
          y: (touch1.clientY + touch2.clientY) / 2,
          distance,
        });
      }
    };
    // handle touch move event
    const handleTouchMove = (e: React.TouchEvent) => {
      e.preventDefault();

      if (e.touches.length === 1 && isPanning) {
        // Single touch panning
        const touch = e.touches[0];
        const dx = touch.clientX - panStart.x;
        const dy = touch.clientY - panStart.y;
        onPanView(dx, dy);
        setPanStart({ x: touch.clientX, y: touch.clientY });
      } else if (e.touches.length === 2 && touchStart) {
        // Pinch zoom
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );

        // FIX HERE: Change 'zoomChange' to 'scaleChange' or fix the variable name
        const scaleChange = currentDistance / touchStart.distance;
        const newZoom = Math.max(0.1, Math.min(3, zoomLevel * scaleChange));
        onZoomChange?.(newZoom);

        // Update touch start for continuous zoom
        setTouchStart({
          x: (touch1.clientX + touch2.clientX) / 2,
          y: (touch1.clientY + touch2.clientY) / 2,
          distance: currentDistance,
        });
      }
    };

    const handleTouchEnd = () => {
      if (isPanning) {
        stopPanning();
      }
      if (touchStart) {
        setTouchStart(null);
      }
    };

    // Wheel zoom for both mouse and touchpad
    const handleWheel = (e: React.WheelEvent) => {
      e.preventDefault();

      // Use ctrlKey for Windows/Linux, metaKey for Mac
      if (e.ctrlKey || e.metaKey) {
        const zoomFactor = 0.01;
        const delta = e.deltaY > 0 ? -zoomFactor : zoomFactor;
        const newZoom = Math.max(0.1, Math.min(3, zoomLevel + delta));
        onZoomChange(newZoom);
      } else {
        // If not zooming, pan with wheel
        onPanView(-e.deltaX * 0.5, -e.deltaY * 0.5);
      }
    };

    const startPanning = (x: number, y: number) => {
      setIsPanning(true);
      setPanStart({ x, y });
      if (containerRef.current) {
        containerRef.current.style.cursor = "grabbing";
      }
    };

    const stopPanning = () => {
      setIsPanning(false);
      if (containerRef.current) {
        containerRef.current.style.cursor = "default";
      }
    };

    const getNodeSize = (node: Node) => {
      const baseSize = isMobile
        ? node.isRoot
          ? 80
          : 60
        : node.isRoot
        ? 120
        : 100;
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

        // Diamond points
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
            onTouchStart: (e: React.TouchEvent) => {
              e.stopPropagation();
              onNodeDragStart(e, node.id);
            },
            style: {
              touchAction: "none", // Prevent browser touch actions
            },
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
            onTouchStart={(e) => {
              e.stopPropagation();
              onNodeDragStart(e, node.id);
            }}
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
              fontSize={
                isMobile ? (node.isRoot ? 12 : 10) : node.isRoot ? 14 : 12
              }
              fontWeight={node.isRoot ? "bold" : "normal"}
              className="select-none"
              style={{
                pointerEvents: "none",
                textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
              }}
            >
              {node.text.length > (isMobile ? 10 : 15)
                ? node.text.substring(0, isMobile ? 10 : 15) + "..."
                : node.text}
            </text>

            {/* Collapse indicator */}
            {isCollapsed && (
              <circle
                cx={width - (isMobile ? 8 : 10)}
                cy={isMobile ? 8 : 10}
                r={isMobile ? 4 : 6}
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
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  onEditNode(node.id);
                }}
                style={{ cursor: "pointer" }}
                className="hover:opacity-80 transition-opacity"
              >
                <circle
                  cx={width}
                  cy={height}
                  r={isMobile ? 8 : 10}
                  fill={nodeColors.selected}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text
                  x={width}
                  y={height + (isMobile ? 2 : 3)}
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

            {/* Hover tooltip - only on desktop */}
            {!isMobile && isHovered && node.description && (
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
                cx={width - (isMobile ? 8 : 10)}
                cy={height - (isMobile ? 8 : 10)}
                r={isMobile ? 6 : 8}
                fill={theme === "dark" ? "#374151" : "#F3F4F6"}
                stroke={theme === "dark" ? "#4B5563" : "#D1D5DB"}
                strokeWidth="1"
              >
                <title>{node.children.length} children</title>
                <text
                  x={width - (isMobile ? 8 : 10)}
                  y={height - (isMobile ? 4 : 6)}
                  textAnchor="middle"
                  fill={theme === "dark" ? "#E5E7EB" : "#374151"}
                  fontSize={isMobile ? 7 : 8}
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
        isMobile,
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
          height: "100%",
          minHeight: "500px",
        }}
      >
        <div
          ref={containerRef}
          className="relative w-full h-full overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            cursor: isPanning ? "grabbing" : "default",
            touchAction: "none", // Prevent browser touch actions
          }}
        >
          <svg
            ref={ref}
            width={containerSize.width}
            height={containerSize.height}
            style={{
              transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
              transformOrigin: "0 0",
            }}
            onMouseUp={onNodeDragEnd}
            onTouchEnd={onNodeDragEnd}
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
          <div
            className={`absolute ${
              isMobile ? "bottom-2 left-2" : "bottom-4 left-4"
            } flex flex-wrap gap-2`}
          >
            <div
              className={`px-3 py-2 rounded-lg ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } border ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              } shadow-lg`}
            >
              <div
                className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Zoom: {Math.round(zoomLevel * 100)}%
              </div>
            </div>
            {!isMobile && (
              <div
                className={`px-3 py-2 rounded-lg ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                } border ${
                  theme === "dark" ? "border-gray-700" : "border-gray-200"
                } shadow-lg`}
              >
                <div
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Ctrl+Scroll to zoom | Ctrl+Drag to pan
                </div>
              </div>
            )}
            {isMobile && (
              <div
                className={`px-3 py-2 rounded-lg ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                } border ${
                  theme === "dark" ? "border-gray-700" : "border-gray-200"
                } shadow-lg`}
              >
                <div
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Pinch to zoom | Drag to pan
                </div>
              </div>
            )}
          </div>

          {/* Mobile gesture hint */}
          {isMobile && (
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center">
                    <span className="text-xs">👆</span>
                  </div>
                  <span
                    className={`ml-1 text-xs ${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Drag node
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center">
                    <span className="text-xs">🤏</span>
                  </div>
                  <span
                    className={`ml-1 text-xs ${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Zoom
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

MindMapVisualization.displayName = "MindMapVisualization";

export default MindMapVisualization;
