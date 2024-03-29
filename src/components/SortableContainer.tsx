import React, { useState, useEffect, useRef, ReactElement } from "react";
import "./SortableContainer.css";
import DragIndicator from "./DragIndicator";

interface SortableContainerProps {
  children: ReactElement | ReactElement[];
}

const SortableContainer = ({ children }: SortableContainerProps) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [dragPosition, setDragPosition] = useState<"top" | "bottom" | null>(
    "top"
  );
  const [orderedChildren, setOrderedChildren] = useState(
    React.Children.toArray(children)
  );

  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    e.preventDefault();
    setOverIndex(index);

    const boundingRect = (e.target as HTMLElement).getBoundingClientRect();
    const relativePosition = e.clientY - boundingRect.top;
    const positionPercent = relativePosition / boundingRect.height;

    setDragPosition(positionPercent < 0.5 ? "top" : "bottom");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    setOverIndex(null);

    if (dragIndex !== null) {
      const newOrderedChildren = [...orderedChildren];
      const draggedElement = newOrderedChildren[dragIndex];
      newOrderedChildren.splice(dragIndex, 1);

      let insertIndex;
      if (dragIndex < index) {
        insertIndex = dragPosition === "top" ? index - 1 : index;
      } else {
        insertIndex = dragPosition === "top" ? index : index + 1;
      }
      newOrderedChildren.splice(insertIndex, 0, draggedElement);
      setOrderedChildren(newOrderedChildren);
    }

    setDragIndex(null);
    setDragPosition(null);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const items = Array.from(
        container.getElementsByClassName("container-item")
      );
      items.forEach((item, index) => {
        const htmlItem = item as HTMLElement;
        htmlItem.ondragstart = () => handleDragStart(index);
        htmlItem.ondragover = (e) =>
          handleDragOver(
            e as unknown as React.DragEvent<HTMLDivElement>,
            index
          );
      });

      container.ondrop = (e) => {
        e.preventDefault();
        if (overIndex !== null) {
          handleDrop(
            e as unknown as React.DragEvent<HTMLDivElement>,
            overIndex
          );
        }
      };
      container.ondragover = (e) => {
        e.preventDefault();
      };
    }
    return () => {
      if (container) {
        const items = Array.from(
          container.getElementsByClassName("container-item")
        );
        items.forEach((item) => {
          const htmlItem = item as HTMLElement;
          htmlItem.ondragstart = null;
          htmlItem.ondragover = null;
        });

        container.ondrop = null;
        container.ondragover = null;
      }
    };
  }, [orderedChildren, handleDragStart, handleDragOver, handleDrop, overIndex]);

  return (
    <div className="sortable-container" ref={containerRef}>
      {orderedChildren.map((child, index) => {
        return (
          <>
            {dragIndex !== overIndex &&
              dragIndex !== null &&
              overIndex !== null &&
              index === overIndex &&
              dragPosition === "top" && <DragIndicator />}
            {child}
            {dragIndex !== overIndex &&
              dragIndex !== null &&
              overIndex !== null &&
              index === overIndex &&
              dragPosition === "bottom" && <DragIndicator />}
          </>
        );
      })}
    </div>
  );
};

export default SortableContainer;
