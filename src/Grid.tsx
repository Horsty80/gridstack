import { ComponentProps, useState } from "react";
import { GridStackOptions } from "gridstack";
import {
  ComponentDataType,
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

function Text({ content }: { content: string }) {
  return <div className="w-full h-full">{content}</div>;
}

const COMPONENT_MAP: ComponentMap = {
  Text,
  ItemControls,
  // ... other components here
};

// ! Content must be json string like this:
// { name: "Text", props: { content: "Item 1" } }
const gridOptions: GridStackOptions = {
  margin: 8,
  cellHeight: CELL_HEIGHT,
  minRow: 50,
  float: true,
  children: [
    {
      id: "item1",
      h: 2,
      w: 2,
      x: 0,
      y: 0,
      content: JSON.stringify({
        name: "Text",
        props: { content: "Item 1" },
      } satisfies ComponentDataType<ComponentProps<typeof Text>>), // if need type check
    },
    {
      id: "item2",
      h: 2,
      w: 2,
      x: 2,
      y: 0,
      content: JSON.stringify({
        name: "Text",
        props: { content: "Item 2" },
      }),
    },
  ],
};

export function Grid() {
  // ! Uncontrolled
  const [initialOptions] = useState(gridOptions);

  return (
    <GridStackProvider initialOptions={initialOptions}>
      <Toolbar />

      <GridStackRenderProvider>
        <GridStackRender componentMap={COMPONENT_MAP} />
      </GridStackRenderProvider>
    </GridStackProvider>
  );
}

function Toolbar() {
  const { addWidget } = useGridStackContext();

  return (
    <div
      style={{
        border: "1px solid gray",
        width: "100%",
        padding: "10px",
        marginBottom: "10px",
        display: "flex",
        flexDirection: "row",
        gap: "10px",
      }}
    >
      <button
        onClick={() => {
          addWidget((id) => ({
            w: 3,
            h: 3,
            x: 0,
            y: 0,
            content: JSON.stringify({
              name: "Text",
              props: { content: id },
            }),
          }));
        }}
      >
        Add Text
      </button>
      <button
        onClick={() => {
          addWidget((id) => ({
            w: 3,
            h: 3,
            x: 0,
            y: 0,
            content: JSON.stringify({
              name: "ItemControls",
              props: { content: id, id, bar: id },
            }),
          }));
        }}
      >
        Add Resizable
      </button>
    </div>
  );
}

function ItemControls({ id }: { id: string }) {
  const { gridStack } = useGridStackContext();

  const resizeWidget = (width: number, height: number) => {
    const widget = gridStack?.getGridItems().find((item) => item.getAttribute('gs-id') === id);
    if (widget) {
      gridStack?.update(widget, { w: width, h: height });
    }
  };

  return (
    <div>
      <button onClick={() => resizeWidget(5, 2)}>Increase 3 Horizontally</button>
      <button onClick={() => resizeWidget(2, 4)}>Increase 2 Vertically</button>
      <button onClick={() => resizeWidget(2, 2)}>Reset to 2x2</button>
    </div>
  );
}
