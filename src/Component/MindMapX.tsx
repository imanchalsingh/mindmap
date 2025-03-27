import React from "react";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const InteractiveElement: React.FC = () => {
  const [nodes, setNodes] = useState([
    { id: "1", text: "Central Idea", x: 400, y: 300, isRoot: true },
  ]);
  const [edges, setEdges] = useState<
    { id: string; source: string; target: string }[]
  >([]);
  const [activeNode, setActiveNode] = useState<string | number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [gameState, setGameState] = useState("start");
  const [showInstructions, setShowInstructions] = useState(true);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);

  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef(null);

  // Theme colors based on dark mode
  const theme = useMemo(
    () => ({
      background: isDarkMode ? "#2C3E50" : "#FFFFFF",
      cardBackground: isDarkMode ? "#3E5771" : "#F3DCC5",
      text: isDarkMode ? "#FFFFFF" : "#2C3E50",
      node: isDarkMode ? "#F05A5B" : "#F05A5B",
      nodeStroke: isDarkMode ? "#BF4E30" : "#BF4E30",
      edge: isDarkMode ? "#EAEAEA" : "#BF4E30",
      suggestion: isDarkMode ? "#4A6583" : "#EAEAEA",
    }),
    [isDarkMode]
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
    (nodeId: string | number) => {
      if (gameState !== "playing") return;

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      setActiveNode(nodeId);

      // Generate and show suggestions
      const newSuggestions = generateSuggestions(node.text);
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    },
    [nodes, gameState, generateSuggestions]
  );

  // Add a new node and connect it
  const addNode = useCallback(
    (text: string) => {
      if (!activeNode) return;

      const parentNode = nodes.find((n) => n.id === activeNode);
      if (!parentNode) return;

      const angle = Math.random() * Math.PI * 2;
      const distance = 150 * zoomLevel;

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
        },
      ]);

      setEdges((prev) => [
        ...prev,
        {
          id: `${String(activeNode)}-${newNodeId}`, 
          source: String(activeNode),
          target: newNodeId,
        },
      ]);

      setShowSuggestions(false);
    },
    [activeNode, nodes, zoomLevel]
  );

  // Add custom node
  const addCustomNode = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      addNode(text.trim());
    },
    [addNode]
  );

  // Start the mind mapping
  const startMindMap = useCallback(() => {
    setGameState("playing");
    setShowInstructions(false);
  }, []);

  // Reset the mind map
  const resetMindMap = useCallback(() => {
    setNodes([{ id: "1", text: "Central Idea", x: 400, y: 300, isRoot: true }]);
    setEdges([]);
    setActiveNode(null);
    setShowSuggestions(false);
    setZoomLevel(1);
    setGameState("start");
    setShowInstructions(true);
  }, []);

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
  }, []);

  // Handle node drag start
  const handleNodeDragStart = useCallback(
    (e: React.MouseEvent<SVGElement>, nodeId: string) => {
      if (gameState !== "playing") return;

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) {
        console.error("Node not found:", nodeId);
        return;
      }

      if (!svgRef.current) {
        console.error("SVG reference is null.");
        return;
      }

      const svgRect = svgRef.current.getBoundingClientRect();
      const offsetX = (e.clientX - svgRect.left) / zoomLevel - node.x;
      const offsetY = (e.clientY - svgRect.top) / zoomLevel - node.y;

      setDraggedNode(nodeId);
      setDragOffset({ x: offsetX, y: offsetY });
    },
    [nodes, gameState, zoomLevel]
  );

  // Handle node dragging
  const handleNodeDrag = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!draggedNode || gameState !== "playing") return;
      if (!svgRef.current) return;

      const svgRect = svgRef.current.getBoundingClientRect();
      const x = (e.clientX - svgRect.left) / zoomLevel - dragOffset.x;
      const y = (e.clientY - svgRect.top) / zoomLevel - dragOffset.y;

      setNodes((prev) =>
        prev.map((node) => (node.id === draggedNode ? { ...node, x, y } : node))
      );
    },
    [draggedNode, dragOffset, gameState, zoomLevel]
  );

  // Handle node drag end
  const handleNodeDragEnd = useCallback(() => {
    setDraggedNode(null);
  }, []);

  // Handle node drag start (for touch devices)
  const handleNodeTouchStart = useCallback(
    (e: React.TouchEvent<SVGElement>, nodeId: string) => {
      if (gameState !== "playing") return;

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) {
        console.error("Node not found:", nodeId);
        return;
      }

      if (!svgRef.current) {
        console.error("SVG reference is null.");
        return;
      }

      const svgRect = svgRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const offsetX = (touch.clientX - svgRect.left) / zoomLevel - node.x;
      const offsetY = (touch.clientY - svgRect.top) / zoomLevel - node.y;

      setDraggedNode(nodeId);
      setDragOffset({ x: offsetX, y: offsetY });
    },
    [nodes, gameState, zoomLevel]
  );

  // Handle node dragging (for touch devices)
  const handleNodeTouchMove = useCallback(
    (e: React.TouchEvent<SVGSVGElement>) => {
      if (!draggedNode || gameState !== "playing") return;
      if (!svgRef.current) return;

      const svgRect = svgRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const x = (touch.clientX - svgRect.left) / zoomLevel - dragOffset.x;
      const y = (touch.clientY - svgRect.top) / zoomLevel - dragOffset.y;

      setNodes((prev) =>
        prev.map((node) => (node.id === draggedNode ? { ...node, x, y } : node))
      );
    },
    [draggedNode, dragOffset, gameState, zoomLevel]
  );

  // Handle node drag end (for touch devices)
  const handleNodeTouchEnd = useCallback(() => {
    setDraggedNode(null);
  }, []);

  // Add mouse event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggedNode) {
        handleNodeDrag(e as unknown as React.MouseEvent<SVGSVGElement>);
      }
    };

    const handleMouseUp = () => {
      if (draggedNode) {
        handleNodeDragEnd();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggedNode, handleNodeDrag, handleNodeDragEnd]); 

  // Add touch event listeners
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (draggedNode) {
        handleNodeTouchMove(e as unknown as React.TouchEvent<SVGSVGElement>);
      }
    };

    const handleTouchEnd = () => {
      if (draggedNode) {
        handleNodeTouchEnd();
      }
    };

    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [draggedNode, handleNodeTouchMove, handleNodeTouchEnd]);

  // Export mind map as JSON
  const exportAsJSON = useCallback(() => {
    const data = {
      nodes,
      edges,
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "mindmap.json";
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  }, [nodes, edges]);

  // Summary of the mind map
  const finishMindMap = useCallback(() => {
    setGameState("win");
  }, []);

  interface Node {
    id: string;
    text: string;
    x: number;
    y: number;
    isRoot: boolean;
  }
  interface Edge {
    id: string;
    source: string;
    target: string;
  }

  const renderNode = useCallback(
    (node: Node) => {
      const isActive = node.id === activeNode;
      const nodeSize = node.isRoot ? 100 : 80;

      return (
        <g
          key={node.id}
          transform={`translate(${node.x - nodeSize / 2}, ${
            node.y - nodeSize / 3
          })`}
          onClick={() => handleNodeClick(node.id)}
          onMouseDown={(e) => handleNodeDragStart(e, node.id)}
          onTouchStart={(e) => handleNodeTouchStart(e, node.id)} // Added touch start
          style={{ cursor: "move" }}
        >
          <rect
            width={nodeSize}
            height={nodeSize * 0.6}
            rx={10}
            fill={node.isRoot ? "#F05A5B" : theme.node}
            style={{
              transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
              opacity: 1,
              transform: 'scale(1)'
            }}
          />
          <rect
            width={nodeSize}
            height={nodeSize * 0.6}
            rx={10}
            fill={node.isRoot ? "#F05A5B" : theme.node}
            stroke={isActive ? "#FFFFFF" : theme.nodeStroke}
            strokeWidth={isActive ? 3 : 1}
            style={{
              transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
              opacity: 1,
              transform: 'scale(1)',
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))"
            }}
          />
          <text
            x={nodeSize / 2}
            y={nodeSize * 0.35}
            textAnchor="middle"
            fill={node.isRoot ? "#FFFFFF" : theme.text}
            fontSize={node.isRoot ? 14 : 12}
            fontWeight={node.isRoot ? "bold" : "normal"}
            style={{ pointerEvents: "none" }}
          >
            {node.text}
          </text>
        </g>
      );
    },
    [activeNode, theme, handleNodeClick, handleNodeDragStart, handleNodeTouchStart]
  );

  // Render edge
  const renderEdge = useCallback(
    (edge: Edge) => {
      const source = nodes.find((n) => n.id === edge.source);
      const target = nodes.find((n) => n.id === edge.target);

      if (!source || !target) return null;

      return (
        <line
          key={edge.id}
          x1={source.x}
          y1={source.y}
          x2={target.x}
          y2={target.y}
          stroke={theme.edge}
          strokeWidth={2}
          strokeDasharray={
            draggedNode &&
            (edge.source === draggedNode || edge.target === draggedNode)
              ? "5,5"
              : ""
          }
        />
      );
    },
    [nodes, theme.edge, draggedNode]
  );

  return (
    <div className="p-4 dark:bg-slate-900">
      <Card
        className="w-[95vw] md:w-[90vw] lg:w-[85vw] max-w-7xl mx-auto"
        style={{ backgroundColor: theme.cardBackground }}
      >
        <CardHeader className="bg-gradient-to-r from-[#F05A5B] to-[#BF4E30] text-white rounded-t-lg">
          <CardTitle className="text-xl md:text-2xl flex items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
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
              <path d="m4.929 4.929.707.707a1 1 0 1 1-1.414 1.414l-.707-.707a1 1 0 0 1 1.414-1.414Z"></path>
              <path d="m19.071 19.071.707.707a1 1 0 0 1-1.414 1.414l-.707-.707a1 1 0 0 1 1.414-1.414Z"></path>
              <path d="M2 12a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2H3a1 1 0 0 1-1-1Z"></path>
              <path d="M19 12a1 1 0 0 1 1-1h1a1 1 0 0 1 0 2h-1a1 1 0 0 1-1-1Z"></path>
              <path d="m4.929 19.071.707-.707a1 1 0 0 1 1.414 1.414l-.707.707a1 1 0 0 1-1.414-1.414Z"></path>
              <path d="m19.071 4.929.707-.707a1 1 0 0 1 1.414 1.414l-.707.707a1 1 0 0 1-1.414-1.414Z"></path>
            </svg>
            MindMapX: Visualize Your Ideas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center h-full">
          <div className="w-full flex flex-col md:flex-row gap-4 h-full">
            {/* Tool Controls */}
            <div
              className="w-full md:w-1/4 flex flex-col gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md"
              style={{ backgroundColor: isDarkMode ? "#2C3E50" : "#FFFFFF" }}
            >
              {gameState === "start" && (
                <div className="flex flex-col gap-4 h-full justify-center">
                  <h3
                    className="text-lg font-semibold text-center"
                    style={{ color: theme.text }}
                  >
                    Welcome to MindMapX
                  </h3>

                  {showInstructions && (
                    <Alert className="bg-[#F3DCC5] dark:bg-slate-700 border border-[#BF4E30]">
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
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                      <AlertTitle className="text-[#2C3E50] dark:text-white font-semibold">
                        How to use MindMapX
                      </AlertTitle>
                      <AlertDescription className="text-[#2C3E50] dark:text-white text-base">
                        <ul className="list-disc pl-5 mt-2">
                          <li>Click on any node to create connected ideas</li>
                          <li>Drag nodes to rearrange your mind map</li>
                          <li>Use AI suggestions to expand your thoughts</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div style={{
                    transition: 'transform 0.3s ease-in-out',
                    transform: 'scale(1)',
                    animation: 'pulse 2s infinite'
                  }}>
                    <Button
                      style={{ color: "#fff" }}
                      className="w-full bg-[#F05A5B] hover:bg-[#BF4E30] text-white"
                      onClick={startMindMap}
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
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                      Start Mind Mapping
                    </Button>
                  </div>
                </div>
              )}

              {gameState === "playing" && (
                <>
                  {activeNode && showSuggestions && (
                    <div className="mb-4">
                      <h3
                        className="text-sm font-semibold mb-2"
                        style={{ color: theme.text }}
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
                          className="inline mr-1"
                        >
                          <path d="M2 12h5"></path>
                          <path d="M9 12h5"></path>
                          <path d="M16 12h6"></path>
                          <path d="M12 2v5"></path>
                          <path d="M12 9v5"></path>
                          <path d="M12 16v6"></path>
                        </svg>
                        AI Suggestions
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        {suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="text-left justify-start text-wrap"
                            style={{
                              backgroundColor: theme.suggestion,
                              color: theme.text,
                              borderColor: theme.nodeStroke,
                            }}
                            onClick={() => addNode(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <Label
                        htmlFor="custom-node"
                        style={{ color: theme.text }}
                      >
                        Add Custom Node
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="custom-node"
                          placeholder="Enter text..."
                          className="bg-white dark:bg-slate-700"
                          disabled={!activeNode}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              const input = e.target as HTMLInputElement;
                              addCustomNode(input.value);
                            }
                          }}
                        />

                        <Button
                          size="sm"
                          className="bg-[#F05A5B] hover:bg-[#BF4E30] text-white"
                          disabled={!activeNode}
                          onClick={(e) => {
                            const target = e.target as HTMLElement;
                            const input =
                              target.previousElementSibling as HTMLInputElement;

                            if (input && "value" in input) {
                              addCustomNode(input.value);
                              input.value = "";
                            }
                          }}
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

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <Button
                        style={{ color: "#fff" }}
                        variant="outline"
                        className="flex items-center justify-center"
                        onClick={() =>
                          setZoomLevel(Math.min(zoomLevel + 0.1, 1.5))
                        }
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
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                          <line x1="11" y1="8" x2="11" y2="14"></line>
                          <line x1="8" y1="11" x2="14" y2="11"></line>
                        </svg>
                        <span className="ml-1">Zoom In</span>
                      </Button>
                      <Button
                        style={{ color: "#fff" }}
                        variant="outline"
                        className="flex items-center justify-center"
                        onClick={() =>
                          setZoomLevel(Math.max(zoomLevel - 0.1, 0.5))
                        }
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
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                          <line x1="8" y1="11" x2="14" y2="11"></line>
                        </svg>
                        <span className="ml-1">Zoom Out</span>
                      </Button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <Label
                        htmlFor="theme-toggle"
                        style={{ color: theme.text }}
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
                          className="inline mr-1"
                        >
                          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                        </svg>
                        Dark Mode
                      </Label>
                      <Switch
                        id="theme-toggle"
                        checked={isDarkMode}
                        onCheckedChange={setIsDarkMode}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <Button
                        style={{ color: "#fff" }}
                        variant="outline"
                        className="flex items-center justify-center text-wrap"
                        onClick={exportAsImage}
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
                          className="mr-1"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Export PNG
                      </Button>
                      <Button
                        style={{ color: "#fff" }}
                        variant="outline"
                        className="flex items-center justify-center text-wrap"
                        onClick={exportAsJSON}
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
                          className="mr-1"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Export JSON
                      </Button>
                    </div>

                    <Button
                      className="mt-4 bg-[#F05A5B] hover:bg-[#BF4E30] text-white"
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
                        className="mr-1"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Finish Mind Map
                    </Button>
                  </div>
                </>
              )}

              {gameState === "win" && (
                <div className="flex flex-col gap-4">
                  <h3
                    className="text-lg font-semibold text-center"
                    style={{ color: theme.text }}
                  >
                    Mind Map Complete!
                  </h3>

                  <Alert className="bg-[#F3DCC5] dark:bg-slate-700 border border-[#BF4E30]">
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
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <AlertTitle className="text-[#2C3E50] dark:text-white font-semibold">
                      Summary
                    </AlertTitle>
                    <AlertDescription className="text-[#2C3E50] dark:text-white text-base">
                      <p className="mb-2">You've created a mind map with:</p>
                      <ul className="list-disc pl-5">
                        <li>{nodes.length} nodes</li>
                        <li>{edges.length} connections</li>
                        <li>{nodes.length - 1} unique ideas</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button
                      style={{ color: "#fff" }}
                      variant="outline"
                      className="flex items-center justify-center text-wrap"
                      onClick={exportAsImage}
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
                        className="mr-1"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Export PNG
                    </Button>
                    <Button
                      style={{ color: "#fff" }}
                      variant="outline"
                      className="flex items-center justify-center text-wrap"
                      onClick={exportAsJSON}
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
                        className="mr-1"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Export JSON
                    </Button>
                  </div>

                  <Button
                    className="mt-4 bg-[#F05A5B] hover:bg-[#BF4E30] text-white"
                    onClick={resetMindMap}
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
                      className="mr-1"
                    >
                      <path d="M3 2v6h6"></path>
                      <path d="M3 13a9 9 0 1 0 3-7.7L3 8"></path>
                    </svg>
                    Start New Mind Map
                  </Button>
                </div>
              )}
            </div>

            {/* Mind Map Visualization */}
            <div
              className="w-full md:w-3/4 aspect-ratio-[16/9] bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden"
              style={{ backgroundColor: theme.background }}
              ref={containerRef}
            >
              <AspectRatio ratio={16 / 9} className="w-full h-full">
                <svg
                  ref={svgRef}
                  width="100%"
                  height="100%"
                  viewBox="0 0 800 600"
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: "center",
                    transition: "transform 0.3s ease-in-out",
                  }}
                >
                  <g>
                    {edges.map(renderEdge)}
                    {nodes.map(renderNode)}
                  </g>
                </svg>
              </AspectRatio>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveElement;
