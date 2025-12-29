import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SuggestionsPanelProps {
  activeNode: string;
  nodes: Array<{ id: string; text: string }>;
  suggestions: string[];
  isGeneratingSuggestions: boolean;
  onAddNode: (text: string) => void;
}

const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({
  activeNode,
  nodes,
  suggestions,
  isGeneratingSuggestions,
  onAddNode,
}) => {
  const activeNodeText = nodes.find((n) => n.id === activeNode)?.text || "";

  return (
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
          <div className="flex items-center gap-2">
            <span>AI Suggestions for "{activeNodeText}"</span>
            {isGeneratingSuggestions && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-[#F05A5B] rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-[#F05A5B] rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-[#F05A5B] rounded-full animate-pulse delay-150"></div>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto py-3 px-2 sm:py-4 sm:px-3 text-left justify-start hover:scale-105 transition-all duration-200 active:scale-95 text-xs sm:text-sm border-gray-600 text-gray-300 hover:bg-gray-700"
              onClick={() => onAddNode(suggestion)}
              disabled={isGeneratingSuggestions}
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
                <span className="font-medium truncate">{suggestion}</span>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SuggestionsPanel;