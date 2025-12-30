# MindMapX Pro  
### Data-Driven Interactive Mind Mapping UI

MindMapX Pro is an advanced, **data-driven interactive mind map application** built to visualize hierarchical information in a clean, scalable, and highly interactive way.

This version extends my original **MindMapX** project and was enhanced as part of a **Frontend Development Internship assignment**, focusing on complex UI interactions, visualization logic, and clean frontend architecture.

---

## Objective

- Build a **fully data-driven mind map UI**
- Visualize hierarchical data dynamically
- Support rich interactions such as hover, click, expand/collapse, drill-down, and pan/zoom
- Maintain **scalable, readable, and maintainable frontend code**

---

## Technologies Used

- **Frontend:** React 18 + TypeScript  
- **Styling:** Tailwind CSS + ShadCN UI Components  
- **Visualization:** SVG-based interactive rendering  
- **State Management:** React Hooks (`useState`, `useCallback`, `useEffect`)  

---

## Architecture Overview

- **Component-Based Design**  
  Modular and reusable React components for better scalability and clarity.

- **Centralized State Management**  
  The main `MindMap` component manages selected nodes, collapse states, and interactions.

- **Unidirectional Data Flow**  
  - Data flows from JSON > parent components > child components via props  
  - User interactions flow upward via callbacks  

- **Responsive Layout**  
  Designed to work smoothly on desktop and smaller screen sizes.

---

## Key Components

- **MindMap.tsx**  
  Main container responsible for loading JSON data and managing global state.

- **MindMapVisualization.tsx**  
  SVG canvas that renders nodes and edges dynamically.

- **MindMapControls.tsx**  
  Toolbar for zoom, reset view, and navigation controls.

- **NodeDetailsPanel.tsx**  
  Side panel displaying detailed information of the selected node.

- **EditNodeDialog.tsx**  
  Modal interface for editing node content (optional / bonus feature).

---

## Data Structure (Core of Data-Driven Design)

The entire UI is generated from a structured JSON / TypeScript data model.

```ts
Node {
  id: string,            // Unique identifier
  text: string,          // Display label
  x: number,
  y: number,             // Position
  isRoot: boolean,       // Root node indicator
  color?: string,        // Node color
  description?: string,  // Tooltip / hover text
  expanded?: boolean,    // Expand / collapse state
  children?: string[],  // Child node IDs
  parent?: string,       // Parent node ID
  size?: "S" | "M" | "L",
  shape?: "rect" | "circle" | "rounded"
}

Edge {
  id: string,
  source: string,
  target: string
}
```
### Data Flow (Very Important)
- The complete mind map structure is defined in a JSON data file
- JSON data is parsed and transformed into nodes and edges
- Visualization is rendered purely from the data
- Any change in the JSON (add / remove / update nodes):
  - Automatically updates the UI
  - No UI code changes are required

### Interactive Features
#### Hover Interaction
Displays quick summary or description of a node.
#### Node Selection
Click to select and highlight related nodes and connections.
#### Expand / Collapse
Toggle visibility of child branches.
#### Drill Down / Drill Up
Navigate deeper into a specific branch or return to the parent level.
#### Pan & Zoom
Drag to pan
Scroll or controls to zoom (30% – 300%)
#### Fit to View / Reset View
Automatically centers the entire mind map.

### User Experience Enhancements
1. Visual feedback for selected nodes
2. Smooth transitions for clarity
3. Side panel for detailed node information
4. Keyboard-friendly interactions
5. Responsive layout for different screen sizes

### 📸 Screenshots  
Screenshots are stored inside the `/screenshots` directory.

<table>
  <tr>
    <td align="center">
      <img src="https://github.com/imanchalsingh/mindmap/blob/main/screenshots/editNodeDetails.png"
           alt="Full Mind Map View"
           width="400" />
      <br/>
      <b>Edit Node</b>
    </td>
    <td align="center">
      <img src="https://github.com/imanchalsingh/mindmap/blob/main/screenshots/hover-tooltip.png"
           alt="Node Hover Interaction"
           width="400" />
      <br/>
      <b>Node Hover Interaction and Full mindmap view</b>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://github.com/imanchalsingh/mindmap/blob/main/screenshots/ImportExport.png"
           alt="Import and Export"
           width="400" />
      <br/>
      <b>Import & Export</b>
    </td>
    <td align="center">
      <img src="https://github.com/imanchalsingh/mindmap/blob/main/screenshots/collapseAndExpnad.png"
           alt="Expanded and Collapsed State"
           width="400" />
      <br/>
      <b>Expanded & Collapsed State</b>
    </td>
  </tr>
</table>

### Demo Video
- A short demo video demonstrating:
- Pan and zoom navigation
- Hover behavior
- Node selection and side panel updates
- Expand and collapse functionality
- Drill down and drill up navigation
- Data-driven updates reflected visually

### Demo Video Link:
![Demo Video of MindMapX](https://github.com/imanchalsingh/mindmap/blob/main/demoVideo/demoVideoMindMapX.mp4)

## What This Assignment Demonstrates
1. Fully data-driven UI rendering
2. Handling of complex user interactions
3. Scalable and maintainable frontend architecture
4. Clean separation of data and presentation
5. Real-world frontend problem-solving approach

### Live Demo
Live App: https://mindmapx-imanchalsingh.vercel.app

### Notes
- Priority was given to clarity, correctness, and extensibility
- The UI focuses on functional parity rather than pixel-perfect replication
