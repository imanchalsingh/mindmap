import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  nodes: any[];
  edges: any[];
  activeNode: string | null;
  colorPalette: string[];
  nodeColors: {
    root: string;
    child: string;
    selected: string;
  };
  onStartMindMap: () => void;
  onAddCustomNode: (text: string) => void;
  onUpdateColorScheme: (type: "root" | "child" | "selected", color: string) => void;
  onExportAsImage: () => void;
  onExportAsJSON: () => void;
  onResetMindMap: () => void;
  onFinishMindMap: () => void;
}

const MindMapControls: React.FC<MindMapControlsProps> = ({
  gameState,
  showInstructions,
  customNodeText,
  setCustomNodeText,
  zoomLevel,
  setZoomLevel,
  nodes,
  edges,
  activeNode,
  colorPalette,
  onStartMindMap,
  onAddCustomNode,
  onUpdateColorScheme,
  onExportAsImage,
  onExportAsJSON,
  onResetMindMap,
  onFinishMindMap,
}) => {
  return (
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
              <TabsTrigger value="settings" className="text-xs sm:text-sm">
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="actions" className="space-y-3 sm:space-y-4">
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
                    onClick={onStartMindMap}
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
                            onAddCustomNode(customNodeText);
                          }
                        }}
                        className="flex-1 bg-gray-700 border-gray-600 text-gray-200 text-sm"
                        disabled={!activeNode}
                      />
                      <Button
                        size="icon"
                        className="bg-gradient-to-r from-[#F05A5B] to-[#BF4E30] hover:from-[#E04A4B] hover:to-[#AF3E20]"
                        disabled={!activeNode || !customNodeText.trim()}
                        onClick={() => onAddCustomNode(customNodeText)}
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
                      onClick={onFinishMindMap}
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
                        onClick={onExportAsImage}
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
                        onClick={onExportAsJSON}
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
                      onClick={onResetMindMap}
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
                      onClick={onExportAsImage}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs sm:text-sm"
                    >
                      Export PNG
                    </Button>
                    <Button
                      variant="outline"
                      onClick={onExportAsJSON}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs sm:text-sm"
                    >
                      Export JSON
                    </Button>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-[#F05A5B] to-[#BF4E30] hover:from-[#E04A4B] hover:to-[#AF3E20] text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                    onClick={onResetMindMap}
                  >
                    Create New Mind Map
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="colors" className="space-y-3 sm:space-y-4">
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
                        onClick={() => onUpdateColorScheme("root", color)}
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
                      onClick={() => onUpdateColorScheme("root", color)}
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
                        onClick={() => onUpdateColorScheme("child", color)}
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
                      onClick={() => onUpdateColorScheme("child", color)}
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
                        onClick={() => onUpdateColorScheme("selected", color)}
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
                      onClick={() => onUpdateColorScheme("selected", color)}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs sm:text-sm font-medium">
                  Instructions
                </Label>
                <div className="text-xs text-gray-400">
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Click on nodes to select and get AI suggestions</li>
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
                  MindMapX Pro v2.1 (AI-Powered)
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MindMapControls;