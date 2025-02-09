import type { GridStack, GridStackOptions, GridStackWidget } from "gridstack";
import { type PropsWithChildren, useCallback, useState } from "react";
import { GridStackContext } from "./grid-stack-context";

export function GridStackProvider({
  children,
  initialOptions,
}: PropsWithChildren<{ initialOptions: GridStackOptions }>) {
  const [gridStack, setGridStack] = useState<GridStack | null>(null);
  const [rawWidgetMetaMap, setRawWidgetMetaMap] = useState(() => {
    const map = new Map<string, GridStackWidget>();
    const deepFindNodeWithContent = (obj: GridStackWidget) => {
      if (obj.id && obj.content) {
        map.set(obj.id, obj);
      }
    };
    initialOptions.children?.forEach((child: GridStackWidget) => {
      deepFindNodeWithContent(child);
    });
    return map;
  });

  const addWidget = useCallback(
    (fn: (id: string) => Omit<GridStackWidget, "id">) => {
      const newId = `widget-${Math.random().toString(36).substring(2, 15)}`;
      const widget = fn(newId);
      gridStack?.addWidget({ ...widget, id: newId });
      setRawWidgetMetaMap((prev) => {
        const newMap = new Map<string, GridStackWidget>(prev);
        newMap.set(newId, widget);
        return newMap;
      });
    },
    [gridStack]
  );

  const removeWidget = useCallback(
    (id: string) => {
      gridStack?.removeWidget(id);
      setRawWidgetMetaMap((prev) => {
        const newMap = new Map<string, GridStackWidget>(prev);
        newMap.delete(id);
        return newMap;
      });
    },
    [gridStack]
  );

  const saveOptions = useCallback(() => {
    return gridStack?.save(true, true, (_, widget) => widget);
  }, [gridStack]);

  return (
    <GridStackContext.Provider
      value={{
        initialOptions,
        gridStack,

        addWidget,
        removeWidget,
        saveOptions,

        _gridStack: {
          value: gridStack,
          set: setGridStack,
        },
        _rawWidgetMetaMap: {
          value: rawWidgetMetaMap,
          set: setRawWidgetMetaMap,
        },
      }}
    >
      {children}
    </GridStackContext.Provider>
  );
}
