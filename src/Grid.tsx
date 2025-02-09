import { useState, useRef, useEffect } from "react";
import { GridStackOptions, GridStackWidget } from "gridstack";
import {
  ComponentMap,
  GridStackProvider,
  GridStackRender,
  GridStackRenderProvider,
  useGridStackContext,
} from "./lib";

import "gridstack/dist/gridstack-extra.css";
import "gridstack/dist/gridstack.css";
import "./grid.css";

const CELL_HEIGHT = 50;
const CELL_MARGIN = 4; // Updated to match the margin defined in gridstack.scss

const COMPONENT_MAP: ComponentMap = {
  ItemControls,
  // ... other components here
};

// ! Content must be json string like this:
// { name: "Text", props: { content: "Item 1" } }
const gridOptions: GridStackOptions = {
  margin: CELL_MARGIN,
  cellHeight: CELL_HEIGHT,
  sizeToContent: true,
  minRow: 10,
  float: true,
};

export function Grid() {
  // ! Uncontrolled
  const [initialOptions] = useState(gridOptions);

  return (
    <GridStackProvider initialOptions={initialOptions}>
      <GridStackRenderProvider>
        <GridStackRender componentMap={COMPONENT_MAP} />
      </GridStackRenderProvider>
    </GridStackProvider>
  );
}

function ItemControls({ id }: { id: string }) {
  const { gridStack } = useGridStackContext();
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const items = gridStack?.getGridItems().find((item) => item.getAttribute("gs-id") === id);
    if (items) {
      const x = items.getAttribute("gs-x");
      const y = items.getAttribute("gs-y");
      setCoordinates({ x: Number(x), y: Number(y) });
        const w = items.getAttribute("gs-w");
        const h = items.getAttribute("gs-h");
        setSize({ w: Number(w), h: Number(h) });
    }
  }, [gridStack, id]);

  const resizeWidget = (width: number, height: number) => {
    const widget = gridStack?.getGridItems().find((item) => item.getAttribute("gs-id") === id);
    if (widget) {
      gridStack?.update(widget, { w: width, h: height });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent:"center", alignItems:"center", height: "100%" }}>
      (x,y): ({coordinates.x},{coordinates.y})
      <button onClick={() => resizeWidget(8, 3)}>(8x3)</button>
      <button onClick={() => resizeWidget(3, 8)}>(3x8)</button>
      <button onClick={() => resizeWidget(2, 2)}>(2x2)</button>
    </div>
  );
}

export function WidgetOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const { addWidget } = useGridStackContext();
  const [coordonates, setCoordonates] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("#overlay-container")) {
        const gridElement = target.closest(".grid-stack") as HTMLElement;
        const rect = gridElement.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / (CELL_HEIGHT + CELL_MARGIN));
        const y = Math.floor((event.clientY - rect.top) / (CELL_HEIGHT + CELL_MARGIN));
        setCoordonates({ x, y });
        if (overlayRef.current) {
          overlayRef.current.style.display = "block";
          overlayRef.current.style.left = `${x * (CELL_HEIGHT + CELL_MARGIN)}px`;
          overlayRef.current.style.top = `${y * (CELL_HEIGHT + CELL_MARGIN)}px`;
        }
      }
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("#overlay-container")) {
        const gridElement = target.closest(".grid-stack") as HTMLElement;
        const rect = gridElement.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / (CELL_HEIGHT + CELL_MARGIN));
        const y = Math.floor((event.clientY - rect.top) / (CELL_HEIGHT + CELL_MARGIN));

        console.log("Add widget at", x, y);
        addWidget((id) => ({
          w: 3,
          h: 3,
          x,
          y,
          noResize: true,
          content: JSON.stringify({
            name: "ItemControls",
            props: { id, x, y, w: 3, h: 3 },
          }),
        }));
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("click", handleClick);
    };
  }, [addWidget]);

  return (
    <div
      ref={overlayRef}
      style={{
        display: "none",
        position: "absolute",
        width: `${3 * CELL_HEIGHT + CELL_MARGIN}px`,
        height: `${3 * CELL_HEIGHT + CELL_MARGIN}px`,
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        pointerEvents: "none",
      }}
    >
      {coordonates.x},{coordonates.y}
    </div>
  );
}
