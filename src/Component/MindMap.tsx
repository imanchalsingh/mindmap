import React from "react";
import { useState, useRef, useEffect,  useCallback } from "react";
import MindMapControls from "./MindMapControls";
import MindMapVisualization from "./MindMapVisualization";
import SuggestionsPanel from "./SuggestionsPanel";
import EditNodeDialog from "./EditNodeDialog";

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

const MindMap: React.FC = () => {
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
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  const [nodeColors, setNodeColors] = useState({
    root: "#F05A5B",
    child: "#4A90E2",
    selected: "#FF6B6B",
  });

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Real-time AI suggestions using OpenAI API (client-side)
  const generateAISuggestions = useCallback(async (nodeText: string) => {
    setIsGeneratingSuggestions(true);
    try {
      // Direct OpenAI API call from client-side (make sure to use CORS proxy or backend in production)
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a creative brainstorming assistant. Generate 4 relevant ideas or subtopics for a mind map based on the given topic. Return only the suggestions as a JSON array of strings."
            },
            {
              role: "user",
              content: `Generate 4 mind map suggestions for the topic: "${nodeText}". Return as JSON array only.`
            }
          ],
          temperature: 0.7,
          max_tokens: 150,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI suggestions');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      // Parse the response - OpenAI might return JSON or text
      try {
        const parsed = JSON.parse(content);
        return Array.isArray(parsed) ? parsed : [content];
      } catch {
        // If not JSON, split by lines or commas
        const suggestions = content.split('\n').filter((s: string) => s.trim());
        return suggestions.slice(0, 4);
      }
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
      // Fallback to mock suggestions if API fails
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

      return suggestionMap[nodeText] || [
        "New Idea",
        "Related Concept",
        "Example",
        "Sub-category",
      ];
    } finally {
      setIsGeneratingSuggestions(false);
    }
  }, []);

  // Alternative: Use a CORS proxy for OpenAI API
  // const generateAISuggestionsWithProxy = useCallback(async (nodeText: string) => {
  //   setIsGeneratingSuggestions(true);
  //   try {
  //     // Using a CORS proxy (you can deploy your own or use a trusted one)
  //     const proxyUrl = import.meta.env.VITE_API_PROXY_URL || 'https://corsproxy.io/?';
  //     const apiUrl = 'https://api.openai.com/v1/chat/completions';
      
  //     const response = await fetch(`${proxyUrl}${encodeURIComponent(apiUrl)}`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
  //       },
  //       body: JSON.stringify({
  //         model: "gpt-3.5-turbo",
  //         messages: [
  //           {
  //             role: "system",
  //             content: "You are a creative brainstorming assistant. Generate 4 relevant ideas or subtopics for a mind map based on the given topic. Return a JSON array of strings."
  //           },
  //           {
  //             role: "user",
  //             content: `Topic: "${nodeText}"`
  //           }
  //         ],
  //         temperature: 0.7,
  //         max_tokens: 100,
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to fetch AI suggestions');
  //     }

  //     const data = await response.json();
  //     const content = data.choices[0]?.message?.content;
      
  //     // Try to parse as JSON, otherwise use as is
  //     try {
  //       return JSON.parse(content);
  //     } catch {
  //       return [
  //         "Creative Idea 1",
  //         "Related Concept",
  //         "Implementation Plan",
  //         "Future Scope"
  //       ];
  //     }
  //   } catch (error) {
  //     console.error('Error with AI suggestions:', error);
  //     return [
  //       "Innovative Concept",
  //       "Practical Application",
  //       "Technical Aspect",
  //       "User Experience"
  //     ];
  //   } finally {
  //     setIsGeneratingSuggestions(false);
  //   }
  // }, []);

  // Handle node click
  const handleNodeClick = useCallback(
    async (nodeId: string) => {
      if (gameState !== "playing" || isDragging) return;

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      setActiveNode(nodeId);
      setShowSuggestions(false);

      // Generate AI suggestions
      if (import.meta.env.VITE_OPENAI_API_KEY) {
        const newSuggestions = await generateAISuggestions(node.text);
        setSuggestions(newSuggestions);
      } else {
        // Mock suggestions if no API key
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
        
        setSuggestions(suggestionMap[node.text] || [
          "New Idea",
          "Related Concept",
          "Example",
          "Sub-category",
        ]);
      }
      
      setShowSuggestions(true);
    },
    [nodes, gameState, generateAISuggestions, isDragging]
  );

  // Rest of the functions remain the same...
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

      // Update existing nodes
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

      ctx.fillStyle = "#0F172A";
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
  }, []);

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

  // Color palette
  const colorPalette = [
    "#F05A5B", "#4A90E2", "#7B61FF", "#38A169", "#ED8936",
    "#9F7AEA", "#4299E1", "#48BB78", "#F6AD55", "#F56565",
    "#BF4E30", "#3182CE",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#F05A5B] to-[#BF4E30] bg-clip-text text-transparent">
            MindMapX Pro {import.meta.env.VITE_OPENAI_API_KEY ? "(AI-Powered)" : ""}
          </h1>
          <p className="text-gray-300 text-sm sm:text-base mt-1 sm:mt-2">
            Visualize ideas, connect thoughts, and unlock creativity
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Controls Panel */}
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
            onStartMindMap={startMindMap}
            onAddCustomNode={addCustomNode}
            onUpdateColorScheme={updateColorScheme}
            onExportAsImage={exportAsImage}
            onExportAsJSON={exportAsJSON}
            onResetMindMap={resetMindMap}
            onFinishMindMap={finishMindMap}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col gap-4 sm:gap-6">
            {/* Suggestions Panel */}
            {gameState === "playing" && activeNode && showSuggestions && (
              <SuggestionsPanel
                activeNode={activeNode}
                nodes={nodes}
                suggestions={suggestions}
                isGeneratingSuggestions={isGeneratingSuggestions}
                onAddNode={addNode}
              />
            )}

            {/* Mind Map Visualization */}
            <MindMapVisualization
              ref={svgRef}
              containerRef={containerRef}
              nodes={nodes}
              edges={edges}
              activeNode={activeNode}
              draggedNode={draggedNode}
              zoomLevel={zoomLevel}
              gameState={gameState}
              nodeColors={nodeColors}
              isMobile={isMobile}
              onNodeClick={handleNodeClick}
              onNodeDragStart={handleNodeDragStart}
              onNodeDragEnd={handleNodeDragEnd}
              onEditNode={editNode}
            />

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
      <EditNodeDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        editingNode={editingNode}
        editText={editText}
        editColor={editColor}
        colorPalette={colorPalette}
        onEditTextChange={setEditText}
        onEditColorChange={setEditColor}
        onSave={saveEditedNode}
      />
    </div>
  );
};

export default MindMap;