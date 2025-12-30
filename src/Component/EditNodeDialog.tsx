import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Node {
  id: string;
  text: string;
  color?: string;
  description?: string;
  size?: "small" | "medium" | "large";
  shape?: "rectangle" | "circle" | "rounded" | "diamond" | "hexagon" | "octagon" | "triangle" | "oval";
}

interface EditNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingNode: Node | null;
  editText: string;
  editColor: string;
  editDescription: string;
  editSize: "small" | "medium" | "large";
  editShape: "rectangle" | "circle" | "rounded" | "diamond" | "hexagon" | "octagon" | "triangle" | "oval";
  colorPalette: string[];
  onEditTextChange: (text: string) => void;
  onEditColorChange: (color: string) => void;
  onEditDescriptionChange: (description: string) => void;
  onEditSizeChange: (size: "small" | "medium" | "large") => void;
  onEditShapeChange: (shape: "rectangle" | "circle" | "rounded" | "diamond" | "hexagon" | "octagon" | "triangle" | "oval") => void;
  onSave: () => void;
  theme: "dark" | "light";
}

const EditNodeDialog: React.FC<EditNodeDialogProps> = ({
  open,
  onOpenChange,
  editingNode,
  editText,
  editColor,
  editDescription,
  editSize,
  editShape,
  colorPalette,
  onEditTextChange,
  onEditColorChange,
  onEditDescriptionChange,
  onEditSizeChange,
  onEditShapeChange,
  onSave,
  theme,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
        <DialogHeader>
          <DialogTitle className={theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}>
            Edit Node
          </DialogTitle>
        </DialogHeader>

        {editingNode && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Node Text</Label>
              <Input
                value={editText}
                onChange={(e) => onEditTextChange(e.target.value)}
                className={theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Description</Label>
              <Textarea
                value={editDescription}
                onChange={(e) => onEditDescriptionChange(e.target.value)}
                className={theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Size</Label>
                <Select value={editSize} onValueChange={(value: "small" | "medium" | "large") => onEditSizeChange(value)}>
                  <SelectTrigger className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Shape</Label>
                <Select value={editShape} onValueChange={(value: "rectangle" | "circle" | "rounded" | "diamond" | "hexagon" | "octagon" | "triangle" | "oval") => onEditShapeChange(value)}>
                  <SelectTrigger className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
                    <SelectItem value="rectangle">Rectangle</SelectItem>
                    <SelectItem value="rounded">Rounded</SelectItem>
                    <SelectItem value="circle">Circle</SelectItem>
                    <SelectItem value="diamond">Diamond</SelectItem>
                    <SelectItem value="hexagon">Hexagon</SelectItem>
                    <SelectItem value="octagon">Octagon</SelectItem>
                    <SelectItem value="triangle">Triangle</SelectItem>
                    <SelectItem value="oval">Oval</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Color</Label>
              <div className="flex flex-wrap gap-2">
                {colorPalette.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      editColor === color ? "border-white" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => onEditColorChange(color)}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-[#F05A5B] to-[#BF4E30] hover:from-[#E04A4B] hover:to-[#AF3E20] text-white"
                onClick={onSave}
              >
                Save
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditNodeDialog;