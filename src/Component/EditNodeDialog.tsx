import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Node {
  id: string;
  text: string;
  x: number;
  y: number;
  isRoot: boolean;
  color?: string;
}

interface EditNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingNode: Node | null;
  editText: string;
  editColor: string;
  colorPalette: string[];
  onEditTextChange: (text: string) => void;
  onEditColorChange: (color: string) => void;
  onSave: () => void;
}

const EditNodeDialog: React.FC<EditNodeDialogProps> = ({
  open,
  onOpenChange,
  editingNode,
  editText,
  editColor,
  colorPalette,
  onEditTextChange,
  onEditColorChange,
  onSave,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                onChange={(e) => onEditTextChange(e.target.value)}
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
                    onClick={() => onEditColorChange(color)}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-3 sm:pt-4">
              <Button
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-[#F05A5B] to-[#BF4E30] hover:from-[#E04A4B] hover:to-[#AF3E20]"
                onClick={onSave}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditNodeDialog;