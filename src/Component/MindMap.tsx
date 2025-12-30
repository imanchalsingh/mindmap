import React from "react";
import { useState, useRef, useEffect, useCallback, RefObject } from "react";
import MindMapControls from "./MindMapControls";
import MindMapVisualization from "./MindMapVisualization";
import NodeDetailsPanel from "./NodeDetailsPanel";
import EditNodeDialog from "./EditNodeDialog";

interface NodeData {
  priority?: "low" | "medium" | "high";
  status?: "active" | "completed" | "in-progress" | "planned";
  created?: string;
}

interface Node {
  id: string;
  text: string;
  x: number;
  y: number;
  isRoot: boolean;
  color?: string;
  description?: string;
  expanded?: boolean;
  children?: string[];
  parent?: string;
  data?: NodeData;
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
}

interface Edge {
  id: string;
  source: string;
  target: string;
}

const MOCK_SUGGESTIONS: Record<string, string[]> = {
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

const DEFAULT_NODE_DATA: Partial<Node> = {
  description: "Click to add description...",
  expanded: true,
  children: [],
  data: { priority: "medium", status: "active" },
  size: "medium",
  shape: "rectangle",
};

const MindMap: React.FC = () => {
  // Initialize with a more interesting mind map
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: "1",
      text: "Central Idea",
      x: 500,
      y: 350,
      isRoot: true,
      color: "#F05A5B",
      description:
        "This is your central idea. Click to expand and add more ideas.",
      expanded: true,
      children: ["2", "3", "4", "5"],
      data: {
        priority: "high",
        status: "active",
        created: new Date().toISOString(),
      },
    },
    {
      id: "2",
      text: "Feature 1",
      x: 300,
      y: 200,
      isRoot: false,
      color: "#4A90E2",
      description: "Main features of the project",
      expanded: true,
      parent: "1",
      children: ["6", "7"],
      data: { priority: "high", status: "active" },
    },
    {
      id: "3",
      text: "User Benefits",
      x: 700,
      y: 200,
      isRoot: false,
      color: "#38A169",
      description: "Benefits for end users",
      expanded: true,
      parent: "1",
      children: [],
      data: { priority: "medium", status: "active" },
    },
    {
      id: "4",
      text: "Technical Stack",
      x: 300,
      y: 500,
      isRoot: false,
      color: "#ED8936",
      description: "Technologies used in the project",
      expanded: true,
      parent: "1",
      children: [],
      data: { priority: "medium", status: "active" },
    },
    {
      id: "5",
      text: "Business Model",
      x: 700,
      y: 500,
      isRoot: false,
      color: "#9F7AEA",
      description: "Revenue and business strategy",
      expanded: true,
      parent: "1",
      children: [],
      data: { priority: "low", status: "planned" },
    },
    {
      id: "6",
      text: "Drag & Drop",
      x: 200,
      y: 100,
      isRoot: false,
      color: "#4299E1",
      description: "Drag and drop functionality",
      expanded: true,
      parent: "2",
      children: [],
      data: { priority: "high", status: "completed" },
    },
  ]);

  const [edges, setEdges] = useState<Edge[]>([
    { id: "1-2", source: "1", target: "2" },
    { id: "1-3", source: "1", target: "3" },
    { id: "1-4", source: "1", target: "4" },
    { id: "1-5", source: "1", target: "5" },
    { id: "2-6", source: "2", target: "6" },
    { id: "2-7", source: "2", target: "7" },
  ]);

  const [activeNode, setActiveNode] = useState<string | null>("1");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [gameState, setGameState] = useState<"start" | "playing" | "win">(
    "playing"
  );
  const [showInstructions, setShowInstructions] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [customNodeText, setCustomNodeText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [editText, setEditText] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSize, setEditSize] = useState<"small" | "medium" | "large">(
    "medium"
  );
  const [editShape, setEditShape] = useState<
    | "rectangle"
    | "circle"
    | "rounded"
    | "diamond"
    | "hexagon"
    | "octagon"
    | "triangle"
    | "oval"
  >("rectangle");
  const [nodeDetailsOpen, setNodeDetailsOpen] = useState(true);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [showContextMenu, setShowContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
  } | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [suggestions, setSuggestions] = useState<string[]>(
    MOCK_SUGGESTIONS["Central Idea"]
  );

  const [nodeColors, setNodeColors] = useState({
    root: "#F05A5B",
    child: "#4A90E2",
    selected: "#FF6B6B",
  });

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  // Handle node click
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (gameState !== "playing" || isDragging) return;

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      setActiveNode(nodeId);
      setNodeDetailsOpen(true);

      // Set suggestions for the clicked node
      const nodeSuggestions = MOCK_SUGGESTIONS[node.text] || [
        "New Idea",
        "Related Concept",
        "Example",
        "Sub-category",
      ];
      setSuggestions(nodeSuggestions);
    },
    [nodes, gameState, isDragging]
  );

  // Handle node right-click
  const handleNodeContextMenu = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.preventDefault();
      setShowContextMenu({
        x: e.clientX,
        y: e.clientY,
        nodeId,
      });
    },
    []
  );

  // Add a new node
  const addNode = useCallback(
    (text: string, color?: string) => {
      if (!activeNode) return;

      const parentNode = nodes.find((n) => n.id === activeNode);
      if (!parentNode) return;

      const angle = Math.random() * Math.PI * 2;
      const distance = 200;

      const newX = parentNode.x + Math.cos(angle) * distance;
      const newY = parentNode.y + Math.sin(angle) * distance;

      const newNodeId = `node-${Date.now()}`;

      const newNode: Node = {
        id: newNodeId,
        text,
        x: newX,
        y: newY,
        isRoot: false,
        color: color || nodeColors.child,
        ...DEFAULT_NODE_DATA,
        parent: activeNode,
        description: `Related to: ${parentNode.text}`,
      };

      setNodes((prev) => [...prev, newNode]);
      setEdges((prev) => [
        ...prev,
        {
          id: `${activeNode}-${newNodeId}`,
          source: activeNode,
          target: newNodeId,
        },
      ]);

      // Update parent's children
      setNodes((prev) =>
        prev.map((node) =>
          node.id === activeNode
            ? {
                ...node,
                children: [...(node.children || []), newNodeId],
                expanded: true,
              }
            : node
        )
      );

      setActiveNode(newNodeId);
    },
    [activeNode, nodes, nodeColors.child]
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

  // Add node from suggestion
  const addNodeFromSuggestion = useCallback(
    (suggestion: string) => {
      addNode(suggestion);
    },
    [addNode]
  );

  // Toggle node expand/collapse
  const toggleNodeExpand = useCallback((nodeId: string) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId ? { ...node, expanded: !node.expanded } : node
      )
    );
  }, []);

  // Drill down
  const drillDown = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      // Center on node
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const offsetX = centerX - node.x * zoomLevel;
      const offsetY = centerY - node.y * zoomLevel;

      setPanPosition({ x: offsetX, y: offsetY });
    },
    [nodes, zoomLevel]
  );

  // Drill up
  const drillUp = useCallback(() => {
    if (!activeNode) return;

    const node = nodes.find((n) => n.id === activeNode);
    if (!node?.parent) return;

    const parentNode = nodes.find((n) => n.id === node.parent);
    if (!parentNode) return;

    setActiveNode(node.parent);

    // Center on parent
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const offsetX = centerX - parentNode.x * zoomLevel;
    const offsetY = centerY - parentNode.y * zoomLevel;

    setPanPosition({ x: offsetX, y: offsetY });
  }, [activeNode, nodes, zoomLevel]);

  // Fit view
  const fitView = useCallback(() => {
    if (nodes.length === 0) return;

    const minX = Math.min(...nodes.map((n) => n.x));
    const maxX = Math.max(...nodes.map((n) => n.x));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxY = Math.max(...nodes.map((n) => n.y));

    const width = maxX - minX + 400;
    const height = maxY - minY + 400;

    const scale = Math.min(800 / width, 600 / height, 1.5);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setZoomLevel(scale);
    setPanPosition({
      x: 400 - centerX * scale,
      y: 300 - centerY * scale,
    });
  }, [nodes]);

  // Pan view
  const panView = useCallback((dx: number, dy: number) => {
    setPanPosition((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));
  }, []);

  // Update color scheme
  const updateColorScheme = useCallback(
    (type: "root" | "child" | "selected", color: string) => {
      setNodeColors((prev) => ({ ...prev, [type]: color }));

      if (type === "root") {
        setNodes((prev) =>
          prev.map((node) => (node.isRoot ? { ...node, color } : node))
        );
      } else if (type === "child") {
        setNodes((prev) =>
          prev.map((node) =>
            !node.isRoot && !node.color ? { ...node, color } : node
          )
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
      setEditDescription(node.description || "");
      setEditSize(node.size || "medium");
      setEditShape(node.shape || "rectangle");
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
          ? {
              ...node,
              text: editText,
              color: editColor,
              description: editDescription,
              size: editSize,
              shape: editShape,
            }
          : node
      )
    );
    setEditDialogOpen(false);
  }, [editingNode, editText, editColor, editDescription, editSize, editShape]);

  // zoom change
  const zoomChange = useCallback((newZoomLevel: number) => {
    setZoomLevel(newZoomLevel);
  }, []);

  // Delete node
  const deleteNode = useCallback(
    (nodeId: string) => {
      const nodeToDelete = nodes.find((n) => n.id === nodeId);
      if (!nodeToDelete || nodeToDelete.isRoot) return;

      // Find all children recursively
      const findAllChildren = (id: string): string[] => {
        const node = nodes.find((n) => n.id === id);
        if (!node) return [];

        const children = node.children || [];
        let allChildren = [id];

        children.forEach((childId) => {
          allChildren = [...allChildren, ...findAllChildren(childId)];
        });

        return allChildren;
      };

      const nodesToRemove = findAllChildren(nodeId);

      // Remove edges
      setEdges((prev) =>
        prev.filter(
          (edge) =>
            !nodesToRemove.includes(edge.source) &&
            !nodesToRemove.includes(edge.target)
        )
      );

      // Remove nodes
      setNodes((prev) =>
        prev.filter((node) => !nodesToRemove.includes(node.id))
      );

      // Update parent's children
      const parentId = nodeToDelete.parent;
      if (parentId) {
        setNodes((prev) =>
          prev.map((node) =>
            node.id === parentId
              ? {
                  ...node,
                  children: node.children?.filter(
                    (childId) => childId !== nodeId
                  ),
                }
              : node
          )
        );
      }

      if (activeNode === nodeId) {
        setActiveNode(parentId || null);
        setNodeDetailsOpen(!!parentId);
      }
      setShowContextMenu(null);
    },
    [nodes, activeNode]
  );

  // Start mind map
  const startMindMap = useCallback(() => {
    setGameState("playing");
    setShowInstructions(false);
    setActiveNode("1");
    setNodeDetailsOpen(true);
  }, []);

  // Reset mind map
  const resetMindMap = useCallback(() => {
    setNodes([
      {
        id: "1",
        text: "Central Idea",
        x: 500,
        y: 350,
        isRoot: true,
        color: nodeColors.root,
        description:
          "This is your central idea. Click to expand and add more ideas.",
        expanded: true,
        children: [],
        data: {
          priority: "high",
          status: "active",
          created: new Date().toISOString(),
        },
      },
    ]);
    setEdges([]);
    setActiveNode("1");
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setGameState("playing");
    setShowInstructions(false);
    setCustomNodeText("");
    setNodeDetailsOpen(true);
    setShowContextMenu(null);
    setSuggestions(MOCK_SUGGESTIONS["Central Idea"]);
  }, [nodeColors.root]);

  // Export as image
  const exportAsImage = useCallback(() => {
    if (!svgRef.current) return;

    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      if (!ctx) return;

      ctx.fillStyle = theme === "dark" ? "#0F172A" : "#ffffff";
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
  }, [theme]);

  // Export as JSON
  const exportAsJSON = useCallback(() => {
    const data = {
      nodes,
      edges,
      metadata: {
        created: new Date().toISOString(),
        version: "1.0",
        totalNodes: nodes.length,
        totalEdges: edges.length,
        theme,
        nodeColors,
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
  }, [nodes, edges, theme, nodeColors]);

  // Import from JSON
  const importFromJSON = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);

          if (data.nodes) {
            setNodes(data.nodes);
          }
          if (data.edges) {
            setEdges(data.edges);
          }
          if (data.metadata?.theme) {
            setTheme(data.metadata.theme);
          }
          if (data.metadata?.nodeColors) {
            setNodeColors(data.metadata.nodeColors);
          }

          setGameState("playing");
          setActiveNode(data.nodes[0]?.id || null);
        } catch (error) {
          console.error("Error importing JSON:", error);
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
      event.target.value = "";
    },
    []
  );

  // Finish mind map
  const finishMindMap = useCallback(() => {
    setGameState("win");
  }, []);

  // Handle node drag start
  const handleNodeDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent, nodeId: string) => {
      if (gameState !== "playing") return;

      const node = nodes.find((n) => n.id === nodeId);
      if (!node || !svgRef.current) return;

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
      if (!draggedNode || !svgRef.current) return;

      const svgRect = svgRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const x = (clientX - svgRect.left) / zoomLevel - dragOffset.x;
      const y = (clientY - svgRect.top) / zoomLevel - dragOffset.y;

      setNodes((prev) =>
        prev.map((node) => (node.id === draggedNode ? { ...node, x, y } : node))
      );
    },
    [draggedNode, dragOffset, zoomLevel]
  );

  // Handle node drag end
  const handleNodeDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedNode(null);
  }, []);

  // Handle wheel for zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!containerRef.current?.contains(e.target as globalThis.Node)) return;

      e.preventDefault();

      if (e.ctrlKey) {
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoomLevel((prev) => Math.max(0.3, Math.min(3, prev + delta)));
      } else {
        panView(e.deltaX, e.deltaY);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [panView]);

  // Add mouse event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggedNode) handleNodeDrag(e);
    };

    const handleMouseUp = () => {
      if (draggedNode) handleNodeDragEnd();
      setShowContextMenu(null);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (draggedNode) handleNodeDrag(e);
    };

    const handleTouchEnd = () => {
      if (draggedNode) handleNodeDragEnd();
      setShowContextMenu(null);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowContextMenu(null);
      if (e.key === "Delete" && activeNode) deleteNode(activeNode);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [draggedNode, handleNodeDrag, handleNodeDragEnd, activeNode, deleteNode]);

  // Color palette
  const colorPalette = [
    "#F05A5B",
    "#4A90E2",
    "#7B61FF",
    "#38A169",
    "#ED8936",
    "#9F7AEA",
    "#4299E1",
    "#48BB78",
    "#F6AD55",
    "#F56565",
    "#BF4E30",
    "#3182CE",
    "#805AD5",
    "#DD6B20",
    "#0BC5EA",
  ];

  const activeNodeData = nodes.find((n) => n.id === activeNode);

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      } p-4 md:p-6 font-[kanit]`}
    >
      <div className="max-w-[1920px] mx-auto">
        {/* Top Controls Panel */}
        <div className="mb-6">
          <div
            className={`rounded-lg border p-4 ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <MindMapControls
              gameState={gameState}
              showInstructions={showInstructions}
              customNodeText={customNodeText}
              setCustomNodeText={setCustomNodeText}
              zoomLevel={zoomLevel}
              setZoomLevel={setZoomLevel}
              nodes={nodes}
              edges={edges}
              activeNode={activeNode}
              colorPalette={colorPalette}
              nodeColors={nodeColors}
              theme={theme}
              onToggleTheme={toggleTheme}
              onStartMindMap={startMindMap}
              onAddCustomNode={addCustomNode}
              onAddNodeFromSuggestion={addNodeFromSuggestion}
              onUpdateColorScheme={updateColorScheme}
              onExportAsImage={exportAsImage}
              onExportAsJSON={exportAsJSON}
              onImportFromJSON={importFromJSON}
              onResetMindMap={resetMindMap}
              onFinishMindMap={finishMindMap}
              onToggleNodeExpand={toggleNodeExpand}
              onDrillDown={drillDown}
              onDrillUp={drillUp}
              onFitView={fitView}
            />
          </div>
        </div>

        {/* Main Content Area - Side by Side Layout */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          {/* Visualization Section */}
          <div className="flex-1 flex flex-col gap-4 md:gap-6">
            {/* Suggestions for mobile/tablet */}
            {gameState === "playing" && activeNode && (
              <div
                className={`lg:hidden rounded-lg border p-4 ${
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
                  Suggestions for "{activeNodeData?.text}"
                </h3>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => addNodeFromSuggestion(suggestion)}
                      className={`w-full text-left p-3 rounded transition-all ${
                        theme === "dark"
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mind Map Visualization */}
            <div className="w-full h-[500px] md:h-[600px] lg:h-[700px]">
              <MindMapVisualization
                ref={svgRef}
                containerRef={containerRef as RefObject<HTMLDivElement>}
                nodes={nodes}
                edges={edges}
                activeNode={activeNode}
                draggedNode={draggedNode}
                zoomLevel={zoomLevel}
                panPosition={panPosition}
                gameState={gameState}
                nodeColors={nodeColors}
                theme={theme}
                isMobile={false}
                onNodeClick={handleNodeClick}
                onNodeContextMenu={handleNodeContextMenu}
                onNodeDragStart={handleNodeDragStart}
                onNodeDragEnd={handleNodeDragEnd}
                onEditNode={editNode}
                onDeleteNode={deleteNode}
                onPanView={panView}
                onZoomChange={zoomChange}
              />

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                <div
                  className={`p-3 md:p-4 rounded-lg ${
                    theme === "dark" ? "bg-gray-800" : "bg-white"
                  } border ${
                    theme === "dark" ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <div className="text-xl md:text-2xl font-bold text-[#F05A5B]">
                    {nodes.length}
                  </div>
                  <div
                    className={`text-xs md:text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Total Nodes
                  </div>
                </div>
                <div
                  className={`p-3 md:p-4 rounded-lg ${
                    theme === "dark" ? "bg-gray-800" : "bg-white"
                  } border ${
                    theme === "dark" ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <div className="text-xl md:text-2xl font-bold text-[#4A90E2]">
                    {edges.length}
                  </div>
                  <div
                    className={`text-xs md:text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Connections
                  </div>
                </div>
                <div
                  className={`p-3 md:p-4 rounded-lg ${
                    theme === "dark" ? "bg-gray-800" : "bg-white"
                  } border ${
                    theme === "dark" ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <div className="text-xl md:text-2xl font-bold text-[#38A169]">
                    {Math.max(
                      ...nodes.map((n) => {
                        let depth = 0;
                        let node = n;
                        while (node.parent) {
                          depth++;
                          node = nodes.find((nn) => nn.id === node.parent)!;
                        }
                        return depth;
                      })
                    ) + 1}
                  </div>
                  <div
                    className={`text-xs md:text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Max Depth
                  </div>
                </div>
                <div
                  className={`p-3 md:p-4 rounded-lg ${
                    theme === "dark" ? "bg-gray-800" : "bg-white"
                  } border ${
                    theme === "dark" ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <div className="text-xl md:text-2xl font-bold text-[#ED8936]">
                    {nodes.filter((n) => n.expanded).length}
                  </div>
                  <div
                    className={`text-xs md:text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Expanded
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Panel */}
          <div className="lg:w-80 flex flex-col gap-4 md:gap-6">
            {/* Suggestions for desktop */}
            {gameState === "playing" && activeNode && (
              <div
                className={`hidden lg:block rounded-lg border p-4 ${
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
                  Suggestions for "{activeNodeData?.text}"
                </h3>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => addNodeFromSuggestion(suggestion)}
                      className={`w-full text-left p-3 rounded transition-all ${
                        theme === "dark"
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Node Details Panel */}
            {nodeDetailsOpen && activeNodeData && (
              <NodeDetailsPanel
                node={activeNodeData}
                isOpen={nodeDetailsOpen}
                onClose={() => setNodeDetailsOpen(false)}
                onEdit={() => editNode(activeNodeData.id)}
                onDelete={() => deleteNode(activeNodeData.id)}
                onToggleExpand={() => toggleNodeExpand(activeNodeData.id)}
                onDrillDown={() => drillDown(activeNodeData.id)}
                onDrillUp={activeNodeData.parent ? () => drillUp() : undefined}
                theme={theme}
              />
            )}
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <EditNodeDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        editingNode={editingNode}
        editText={editText}
        editColor={editColor}
        editDescription={editDescription}
        editSize={editSize}
        editShape={editShape}
        colorPalette={colorPalette}
        onEditTextChange={setEditText}
        onEditColorChange={setEditColor}
        onEditDescriptionChange={setEditDescription}
        onEditSizeChange={setEditSize}
        onEditShapeChange={setEditShape}
        onSave={saveEditedNode}
        theme={theme}
      />

      {/* Context Menu */}
      {showContextMenu && (
        <div
          className="fixed z-50"
          style={{ left: showContextMenu.x, top: showContextMenu.y }}
          onClick={() => setShowContextMenu(null)}
        >
          <div
            className={`rounded-lg border shadow-lg p-2 min-w-[200px] ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <button
              onClick={() => {
                editNode(showContextMenu.nodeId);
                setShowContextMenu(null);
              }}
              className={`w-full text-left px-4 py-2 rounded ${
                theme === "dark"
                  ? "text-gray-200 hover:bg-gray-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Edit Node
            </button>
            <button
              onClick={() => {
                toggleNodeExpand(showContextMenu.nodeId);
                setShowContextMenu(null);
              }}
              className={`w-full text-left px-4 py-2 rounded ${
                theme === "dark"
                  ? "text-gray-200 hover:bg-gray-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {nodes.find((n) => n.id === showContextMenu.nodeId)?.expanded
                ? "Collapse"
                : "Expand"}
            </button>
            <button
              onClick={() => {
                drillDown(showContextMenu.nodeId);
                setShowContextMenu(null);
              }}
              className={`w-full text-left px-4 py-2 rounded ${
                theme === "dark"
                  ? "text-gray-200 hover:bg-gray-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              disabled={
                !nodes.find((n) => n.id === showContextMenu.nodeId)?.children
                  ?.length
              }
            >
              Drill Down
            </button>
            <div className="border-t border-gray-600 my-1"></div>
            <button
              onClick={() => {
                deleteNode(showContextMenu.nodeId);
                setShowContextMenu(null);
              }}
              className={`w-full text-left px-4 py-2 rounded text-red-500 hover:bg-red-50 ${
                theme === "dark" ? "hover:bg-red-900/20" : ""
              }`}
            >
              Delete Node
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MindMap;
