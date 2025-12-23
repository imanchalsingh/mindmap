import React from "react";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

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

const InteractiveElement: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: "1",
      text: "Central Idea",
      x: 400,
      y: 300,
      isRoot: true,
      color: "#F05A5B",
    },
  ]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [gameState, setGameState] = useState<"start" | "playing" | "win">(
    "start"
  );
  const [showInstructions, setShowInstructions] = useState(true);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [customNodeText, setCustomNodeText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [editText, setEditText] = useState("");
  const [editColor, setEditColor] = useState("");

  const [nodeColors, setNodeColors] = useState({
    root: "#F05A5B",
    child: "#4A90E2",
    selected: "#FF6B6B",
  });

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Fixed dark theme colors
  const theme = useMemo(
    () => ({
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
    }),
    [nodeColors.child]
  );

  // AI suggestions based on the selected node text
  const generateSuggestions = useCallback((nodeText: string) => {
    const suggestionMap: Record<string, string[]> = {
      "Central Idea": [
        "Feature 1",
        "User Benefits",
        "Technical Stack",
        "Business Model",
      ],
      "Feature 1": ["Drag & Drop", "Real-time Updates", "Export Options"],
      "User Benefits": [
        "Improved Productivity",
        "Visual Organization",
        "Brainstorming Tool",
      ],
      "Technical Stack": ["Front-end", "Back-end", "Database", "AI Components"],
      "Business Model": ["Freemium", "Subscription", "Enterprise"],
      "Drag & Drop": ["Touch Support", "Multi-select", "Grouping"],
      "Export Options": ["PNG", "PDF", "SVG", "JSON"],
      "AI Components": ["NLP Processing", "Suggestion Engine", "Auto-layout"],
    };

    return (
      suggestionMap[nodeText] || [
        "New Idea",
        "Related Concept",
        "Example",
        "Sub-category",
      ]
    );
  }, []);

  // Handle node click
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (gameState !== "playing" || isDragging) return;

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      setActiveNode(nodeId);

      // Generate and show suggestions
      const newSuggestions = generateSuggestions(node.text);
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    },
    [nodes, gameState, generateSuggestions, isDragging]
  );

  // Add a new node and connect it
  const addNode = useCallback(
    (text: string, color?: string) => {
      if (!activeNode) return;

      const parentNode = nodes.find((n) => n.id === activeNode);
      if (!parentNode) return;

      const angle = Math.random() * Math.PI * 2;
      const distance = isMobile ? 100 * zoomLevel : 150 * zoomLevel;

      const newX = parentNode.x + Math.cos(angle) * distance;
      const newY = parentNode.y + Math.sin(angle) * distance;

      const newNodeId = String(Date.now());

      setNodes((prev) => [
        ...prev,
        {
          id: newNodeId,
          text,
          x: newX,
          y: newY,
          isRoot: false,
          color: color || nodeColors.child,
        },
      ]);

      setEdges((prev) => [
        ...prev,
        {
          id: `${activeNode}-${newNodeId}`,
          source: activeNode,
          target: newNodeId,
        },
      ]);

      setShowSuggestions(false);
    },
    [activeNode, nodes, zoomLevel, nodeColors.child, isMobile]
  );

  // Add custom node
  const addCustomNode = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      addNode(text.trim());
      setCustomNodeText("");
    },
    [addNode]
  );

  // Update color scheme
  const updateColorScheme = useCallback(
    (type: "root" | "child" | "selected", color: string) => {
      setNodeColors((prev) => ({ ...prev, [type]: color }));

      // Update existing nodes if it's child color
      if (type === "child") {
        setNodes((prev) =>
          prev.map((node) =>
            !node.isRoot && !node.color ? { ...node, color } : node
          )
        );
      } else if (type === "root") {
        setNodes((prev) =>
          prev.map((node) => (node.isRoot ? { ...node, color } : node))
        );
      }
    },
    []
  );

  // Edit node
  const editNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      setEditingNode(node);
      setEditText(node.text);
      setEditColor(
        node.color || (node.isRoot ? nodeColors.root : nodeColors.child)
      );
      setEditDialogOpen(true);
    },
    [nodes, nodeColors]
  );

  // Save edited node
  const saveEditedNode = useCallback(() => {
    if (!editingNode) return;

    setNodes((prev) =>
      prev.map((node) =>
        node.id === editingNode.id
          ? { ...node, text: editText, color: editColor }
          : node
      )
    );

    setEditDialogOpen(false);
  }, [editingNode, editText, editColor]);

  // Start the mind mapping
  const startMindMap = useCallback(() => {
    setGameState("playing");
    setShowInstructions(false);
  }, []);

  // Reset the mind map
  const resetMindMap = useCallback(() => {
    setNodes([
      {
        id: "1",
        text: "Central Idea",
        x: 400,
        y: 300,
        isRoot: true,
        color: nodeColors.root,
      },
    ]);
    setEdges([]);
    setActiveNode(null);
    setShowSuggestions(false);
    setZoomLevel(1);
    setGameState("start");
    setShowInstructions(true);
    setCustomNodeText("");
  }, [nodeColors.root]);

  // Export mind map as an image
  const exportAsImage = useCallback(() => {
    if (!svgRef.current) return;

    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      if (!ctx) {
        console.error("Failed to get canvas context.");
        return;
      }

      ctx.fillStyle = theme.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "mindmap.png";
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  }, [theme.background]);

  // Handle node drag start
  const handleNodeDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent, nodeId: string) => {
      if (gameState !== "playing") return;

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      if (!svgRef.current) return;

      const svgRect = svgRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const offsetX = (clientX - svgRect.left) / zoomLevel - node.x;
      const offsetY = (clientY - svgRect.top) / zoomLevel - node.y;

      setIsDragging(true);
      setDraggedNode(nodeId);
      setDragOffset({ x: offsetX, y: offsetY });
    },
    [nodes, gameState, zoomLevel]
  );

  // Handle node dragging
  const handleNodeDrag = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!draggedNode || gameState !== "playing") return;
      if (!svgRef.current) return;

      const svgRect = svgRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const x = (clientX - svgRect.left) / zoomLevel - dragOffset.x;
      const y = (clientY - svgRect.top) / zoomLevel - dragOffset.y;

      setNodes((prev) =>
        prev.map((node) => (node.id === draggedNode ? { ...node, x, y } : node))
      );
    },
    [draggedNode, dragOffset, gameState, zoomLevel]
  );

  // Handle node drag end
  const handleNodeDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedNode(null);
  }, []);

  // Add mouse event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggedNode) {
        handleNodeDrag(e);
      }
    };

    const handleMouseUp = () => {
      if (draggedNode) {
        handleNodeDragEnd();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (draggedNode) {
        handleNodeDrag(e);
      }
    };

    const handleTouchEnd = () => {
      if (draggedNode) {
        handleNodeDragEnd();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [draggedNode, handleNodeDrag, handleNodeDragEnd]);

  // Export mind map as JSON
  const exportAsJSON = useCallback(() => {
    const data = {
      nodes,
      edges,
      metadata: {
        created: new Date().toISOString(),
        version: "1.0",
        totalNodes: nodes.length,
        totalEdges: edges.length,
      },
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `mindmap-${new Date().getTime()}.json`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  }, [nodes, edges]);

  // Summary of the mind map
  const finishMindMap = useCallback(() => {
    setGameState("win");
  }, []);

  // Color palette for node color customization
  const colorPalette = [
    "#F05A5B", // Primary red
    "#4A90E2", // Blue
    "#7B61FF", // Purple
    "#38A169", // Green
    "#ED8936", // Orange
    "#9F7AEA", // Violet
    "#4299E1", // Light Blue
    "#48BB78", // Teal
    "#F6AD55", // Amber
    "#F56565", // Coral
    "#BF4E30", // Secondary red
    "#3182CE", // Deep Blue
  ];

  // Render node
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
          onMouseDown={(e) => handleNodeDragStart(e, node.id)}
          onTouchStart={(e) => handleNodeDragStart(e, node.id)}
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
              handleNodeClick(node.id);
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              handleNodeClick(node.id);
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
                editNode(node.id);
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                editNode(node.id);
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
      handleNodeClick,
      handleNodeDragStart,
      draggedNode,
      editNode,
      isMobile,
    ]
  );

  // Render edge
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

  // Reset edit form when dialog closes
  useEffect(() => {
    if (!editDialogOpen) {
      setEditingNode(null);
      setEditText("");
      setEditColor("");
    }
  }, [editDialogOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#F05A5B] to-[#BF4E30] bg-clip-text text-transparent">
            MindMapX Pro
          </h1>
          <p className="text-gray-300 text-sm sm:text-base mt-1 sm:mt-2">
            Visualize ideas, connect thoughts, and unlock creativity
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Main Controls Panel */}
          <div className="lg:w-72 xl:w-80 flex-shrink-0">
            <Card className="border-gray-700 bg-gray-800 shadow-xl h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2 text-gray-200">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-[#F05A5B] to-[#BF4E30]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 2a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1Z"></path>
                      <path d="M12 19a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0v-1a1 1 0 0 1 1-1Z"></path>
                    </svg>
                  </div>
                  Controls
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 sm:space-y-6">
                <Tabs defaultValue="actions" className="w-full">
                  <TabsList className="grid grid-cols-3 mb-3 sm:mb-4 bg-gray-700">
                    <TabsTrigger value="actions" className="text-xs sm:text-sm">
                      Actions
                    </TabsTrigger>
                    <TabsTrigger value="colors" className="text-xs sm:text-sm">
                      Colors
                    </TabsTrigger>
                    <TabsTrigger
                      value="settings"
                      className="text-xs sm:text-sm"
                    >
                      Settings
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="actions"
                    className="space-y-3 sm:space-y-4"
                  >
                    {gameState === "start" && (
                      <>
                        {showInstructions && (
                          <Alert className="bg-gray-700/50 border-gray-600">
                            <AlertTitle className="flex items-center gap-2 text-gray-200 text-sm sm:text-base">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                              </svg>
                              Getting Started
                            </AlertTitle>
                            <AlertDescription className="mt-2 space-y-1 sm:space-y-2 text-gray-300 text-xs sm:text-sm">
                              <p>
                                Click the Start button to begin creating your
                                mind map.
                              </p>
                              <ul className="list-disc pl-4 space-y-1">
                                <li>Click nodes to expand ideas</li>
                                <li>Drag nodes to rearrange</li>
                                <li>Click "E" on nodes to edit</li>
                              </ul>
                            </AlertDescription>
                          </Alert>
                        )}

                        <Button
                          className="w-full py-4 sm:py-6 text-sm sm:text-lg bg-gradient-to-r from-[#F05A5B] to-[#BF4E30] hover:from-[#E04A4B] hover:to-[#AF3E20] text-white shadow-lg hover:shadow-xl transition-all duration-300"
                          onClick={startMindMap}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2"
                          >
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                          Start Mind Mapping
                        </Button>
                      </>
                    )}

                    {gameState === "playing" && (
                      <>
                        {/* Custom Node Input */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="custom-node"
                            className="text-gray-300 text-xs sm:text-sm font-medium"
                          >
                            Add Custom Node
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="custom-node"
                              placeholder="Enter your idea..."
                              value={customNodeText}
                              onChange={(e) =>
                                setCustomNodeText(e.target.value)
                              }
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  addCustomNode(customNodeText);
                                }
                              }}
                              className="flex-1 bg-gray-700 border-gray-600 text-gray-200 text-sm"
                              disabled={!activeNode}
                            />
                            <Button
                              size="icon"
                              className="bg-gradient-to-r from-[#F05A5B] to-[#BF4E30] hover:from-[#E04A4B] hover:to-[#AF3E20]"
                              disabled={!activeNode || !customNodeText.trim()}
                              onClick={() => addCustomNode(customNodeText)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                              </svg>
                            </Button>
                          </div>
                        </div>

                        {/* Zoom Controls */}
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-gray-300 text-xs sm:text-sm font-medium">
                              Zoom: {Math.round(zoomLevel * 100)}%
                            </Label>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  setZoomLevel(Math.max(zoomLevel - 0.1, 0.5))
                                }
                                className="h-7 w-7 sm:h-8 sm:w-8 border-gray-600 text-gray-300 hover:bg-gray-700"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="11" cy="11" r="8"></circle>
                                  <line
                                    x1="21"
                                    y1="21"
                                    x2="16.65"
                                    y2="16.65"
                                  ></line>
                                  <line x1="8" y1="11" x2="14" y2="11"></line>
                                </svg>
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  setZoomLevel(Math.min(zoomLevel + 0.1, 1.5))
                                }
                                className="h-7 w-7 sm:h-8 sm:w-8 border-gray-600 text-gray-300 hover:bg-gray-700"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="11" cy="11" r="8"></circle>
                                  <line
                                    x1="21"
                                    y1="21"
                                    x2="16.65"
                                    y2="16.65"
                                  ></line>
                                  <line x1="11" y1="8" x2="11" y2="14"></line>
                                  <line x1="8" y1="11" x2="14" y2="11"></line>
                                </svg>
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setZoomLevel(1)}
                                className="h-7 w-7 sm:h-8 sm:w-8 border-gray-600 text-gray-300 hover:bg-gray-700"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="11" cy="11" r="8"></circle>
                                  <line
                                    x1="21"
                                    y1="21"
                                    x2="16.65"
                                    y2="16.65"
                                  ></line>
                                </svg>
                              </Button>
                            </div>
                          </div>
                          <Slider
                            value={[zoomLevel]}
                            min={0.5}
                            max={1.5}
                            step={0.1}
                            onValueChange={([value]) => setZoomLevel(value)}
                            className="w-full"
                          />
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <div className="rounded-lg p-3 text-center bg-gray-700/30">
                            <div className="text-xl sm:text-2xl font-bold text-[#F05A5B]">
                              {nodes.length}
                            </div>
                            <div className="text-xs text-gray-400">Nodes</div>
                          </div>
                          <div className="rounded-lg p-3 text-center bg-gray-700/30">
                            <div className="text-xl sm:text-2xl font-bold text-[#F05A5B]">
                              {edges.length}
                            </div>
                            <div className="text-xs text-gray-400">
                              Connections
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2 sm:space-y-3">
                          <Button
                            className="w-full bg-gradient-to-r from-[#F05A5B] to-[#BF4E30] hover:from-[#E04A4B] hover:to-[#AF3E20] text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                            onClick={finishMindMap}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="mr-2"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Finish Mind Map
                          </Button>

                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              className="flex items-center gap-2 text-xs sm:text-sm border-gray-600 text-gray-300 hover:bg-gray-700"
                              onClick={exportAsImage}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                              </svg>
                              PNG
                            </Button>
                            <Button
                              variant="outline"
                              className="flex items-center gap-2 text-xs sm:text-sm border-gray-600 text-gray-300 hover:bg-gray-700"
                              onClick={exportAsJSON}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                              </svg>
                              JSON
                            </Button>
                          </div>

                          <Button
                            variant="destructive"
                            className="w-full hover:scale-[1.02] transition-all duration-300 text-sm sm:text-base"
                            onClick={resetMindMap}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="mr-2"
                            >
                              <path d="M3 2v6h6"></path>
                              <path d="M3 13a9 9 0 1 0 3-7.7L3 8"></path>
                            </svg>
                            Reset
                          </Button>
                        </div>
                      </>
                    )}

                    {gameState === "win" && (
                      <div className="space-y-3 sm:space-y-4">
                        <Alert className="bg-gray-700/50 border-gray-600">
                          <AlertTitle className="flex items-center gap-2 text-[#F05A5B] text-sm sm:text-base">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                              <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            Mind Map Complete!
                          </AlertTitle>
                          <AlertDescription className="mt-2 text-gray-300 text-xs sm:text-sm">
                            <p className="mb-2">
                              You've created an amazing mind map with:
                            </p>
                            <ul className="space-y-1">
                              <li className="flex justify-between">
                                <span>Total Nodes:</span>
                                <Badge
                                  variant="outline"
                                  className="bg-gray-700 text-gray-300 border-gray-600"
                                >
                                  {nodes.length}
                                </Badge>
                              </li>
                              <li className="flex justify-between">
                                <span>Connections:</span>
                                <Badge
                                  variant="outline"
                                  className="bg-gray-700 text-gray-300 border-gray-600"
                                >
                                  {edges.length}
                                </Badge>
                              </li>
                              <li className="flex justify-between">
                                <span>Depth Levels:</span>
                                <Badge
                                  variant="outline"
                                  className="bg-gray-700 text-gray-300 border-gray-600"
                                >
                                  {nodes.length > 1
                                    ? Math.floor(nodes.length / 2)
                                    : 1}
                                </Badge>
                              </li>
                            </ul>
                          </AlertDescription>
                        </Alert>

                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            onClick={exportAsImage}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs sm:text-sm"
                          >
                            Export PNG
                          </Button>
                          <Button
                            variant="outline"
                            onClick={exportAsJSON}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs sm:text-sm"
                          >
                            Export JSON
                          </Button>
                        </div>

                        <Button
                          className="w-full bg-gradient-to-r from-[#F05A5B] to-[#BF4E30] hover:from-[#E04A4B] hover:to-[#AF3E20] text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                          onClick={resetMindMap}
                        >
                          Create New Mind Map
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent
                    value="colors"
                    className="space-y-3 sm:space-y-4"
                  >
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-300 text-xs sm:text-sm font-medium">
                          Root Node Color
                        </Label>
                        <div className="flex gap-1">
                          {colorPalette.slice(0, 3).map((color) => (
                            <button
                              key={color}
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-gray-700 shadow hover:scale-110 transition-transform duration-200"
                              style={{ backgroundColor: color }}
                              onClick={() => updateColorScheme("root", color)}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {colorPalette.map((color) => (
                          <button
                            key={color}
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-gray-600 hover:scale-110 transition-transform duration-200"
                            style={{ backgroundColor: color }}
                            onClick={() => updateColorScheme("root", color)}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-300 text-xs sm:text-sm font-medium">
                          Child Nodes Color
                        </Label>
                        <div className="flex gap-1">
                          {colorPalette.slice(3, 6).map((color) => (
                            <button
                              key={color}
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-gray-700 shadow hover:scale-110 transition-transform duration-200"
                              style={{ backgroundColor: color }}
                              onClick={() => updateColorScheme("child", color)}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {colorPalette.map((color) => (
                          <button
                            key={color}
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-gray-600 hover:scale-110 transition-transform duration-200"
                            style={{ backgroundColor: color }}
                            onClick={() => updateColorScheme("child", color)}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-300 text-xs sm:text-sm font-medium">
                          Selected Node Color
                        </Label>
                        <div className="flex gap-1">
                          {colorPalette.slice(6, 9).map((color) => (
                            <button
                              key={color}
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-gray-700 shadow hover:scale-110 transition-transform duration-200"
                              style={{ backgroundColor: color }}
                              onClick={() =>
                                updateColorScheme("selected", color)
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {colorPalette.map((color) => (
                          <button
                            key={color}
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-gray-600 hover:scale-110 transition-transform duration-200"
                            style={{ backgroundColor: color }}
                            onClick={() => updateColorScheme("selected", color)}
                          />
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="settings"
                    className="space-y-3 sm:space-y-4"
                  >
                    <div className="space-y-2">
                      <Label className="text-gray-300 text-xs sm:text-sm font-medium">
                        Instructions
                      </Label>
                      <div className="text-xs text-gray-400">
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Click on nodes to select and get suggestions</li>
                          <li>Drag nodes to reposition them</li>
                          <li>
                            Click "E" on selected nodes to edit text and color
                          </li>
                          <li>
                            Use the Colors tab to customize default colors
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300 text-xs sm:text-sm font-medium">
                        Version
                      </Label>
                      <div className="text-xs text-gray-400">
                        MindMapX Pro v2.1
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col gap-4 sm:gap-6">
            {/* Suggestions Panel */}
            {gameState === "playing" && activeNode && showSuggestions && (
              <Card className="border-gray-700 bg-gray-800 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-gray-200">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-[#F05A5B] to-[#BF4E30]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12h5"></path>
                        <path d="M9 12h5"></path>
                        <path d="M16 12h6"></path>
                        <path d="M12 2v5"></path>
                        <path d="M12 9v5"></path>
                        <path d="M12 16v6"></path>
                      </svg>
                    </div>
                    AI Suggestions for "
                    {nodes.find((n) => n.id === activeNode)?.text}"
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-auto py-3 px-2 sm:py-4 sm:px-3 text-left justify-start hover:scale-105 transition-all duration-200 active:scale-95 text-xs sm:text-sm border-gray-600 text-gray-300 hover:bg-gray-700"
                        onClick={() => addNode(suggestion)}
                      >
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="mt-1 p-1 sm:p-1.5 rounded bg-gradient-to-r from-[#F05A5B]/20 to-[#BF4E30]/20">
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
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="8" x2="12" y2="12"></line>
                              <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                          </div>
                          <span className="font-medium truncate">
                            {suggestion}
                          </span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mind Map Visualization */}
            <Card className="border-gray-700 bg-gray-800 shadow-xl flex-1 overflow-hidden">
              <CardContent className="p-1 sm:p-2 md:p-0 h-full">
                <AspectRatio ratio={16 / 9} className="w-full h-full">
                  <div
                    ref={containerRef}
                    className="relative w-full h-full overflow-hidden rounded-lg bg-gray-900"
                  >
                    <svg
                      ref={svgRef}
                      width="100%"
                      height="100%"
                      viewBox="0 0 800 600"
                      style={{
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: "center",
                        transition: "transform 0.2s ease",
                      }}
                      onMouseMove={(e) => {
                        if (draggedNode && svgRef.current) {
                          const svgRect =
                            svgRef.current.getBoundingClientRect();
                          const x =
                            (e.clientX - svgRect.left) / zoomLevel -
                            dragOffset.x;
                          const y =
                            (e.clientY - svgRect.top) / zoomLevel -
                            dragOffset.y;

                          setNodes((prev) =>
                            prev.map((node) =>
                              node.id === draggedNode ? { ...node, x, y } : node
                            )
                          );
                        }
                      }}
                      onTouchMove={(e) => {
                        if (
                          draggedNode &&
                          svgRef.current &&
                          e.touches.length > 0
                        ) {
                          const svgRect =
                            svgRef.current.getBoundingClientRect();
                          const touch = e.touches[0];
                          const x =
                            (touch.clientX - svgRect.left) / zoomLevel -
                            dragOffset.x;
                          const y =
                            (touch.clientY - svgRect.top) / zoomLevel -
                            dragOffset.y;

                          setNodes((prev) =>
                            prev.map((node) =>
                              node.id === draggedNode ? { ...node, x, y } : node
                            )
                          );
                        }
                      }}
                      onMouseUp={handleNodeDragEnd}
                      onMouseLeave={handleNodeDragEnd}
                      onTouchEnd={handleNodeDragEnd}
                      onClick={() => {
                        // Clear selection when clicking on empty space
                        setActiveNode(null);
                        setShowSuggestions(false);
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

            {/* Footer Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 hover:scale-[1.02] transition-all duration-300">
                <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-r from-[#F05A5B] to-[#BF4E30]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="8"></line>
                  </svg>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-[#F05A5B]">
                    {nodes.length}
                  </div>
                  <div className="text-xs text-gray-400">Total Nodes</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 hover:scale-[1.02] transition-all duration-300">
                <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-r from-[#F05A5B] to-[#BF4E30]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 12h16"></path>
                    <path d="M13 5l7 7-7 7"></path>
                  </svg>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-[#F05A5B]">
                    {edges.length}
                  </div>
                  <div className="text-xs text-gray-400">Connections</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 hover:scale-[1.02] transition-all duration-300">
                <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-r from-[#F05A5B] to-[#BF4E30]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2v4"></path>
                    <path d="m16 5-3 3"></path>
                    <path d="M18 11h4"></path>
                    <path d="m21 15-3 3"></path>
                    <path d="M12 18v4"></path>
                    <path d="m8 21 3-3"></path>
                    <path d="M6 13H2"></path>
                    <path d="m3 9 3-3"></path>
                  </svg>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-[#F05A5B]">
                    {nodes.length > 1 ? Math.floor(nodes.length / 2) : 1}
                  </div>
                  <div className="text-xs text-gray-400">Depth Levels</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Node Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Edit Node
            </DialogTitle>
          </DialogHeader>

          {editingNode && (
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Node Text</Label>
                <Input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Node Color</Label>
                <div className="flex flex-wrap gap-2">
                  {colorPalette.map((color) => (
                    <button
                      key={color}
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 ${
                        editColor === color
                          ? "border-white scale-110"
                          : "border-transparent"
                      } hover:scale-110 transition-all duration-200`}
                      style={{ backgroundColor: color }}
                      onClick={() => setEditColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-3 sm:pt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => setEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-[#F05A5B] to-[#BF4E30] hover:from-[#E04A4B] hover:to-[#AF3E20]"
                  onClick={saveEditedNode}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InteractiveElement;
