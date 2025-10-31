"use client";

import { useState, useRef, useEffect, ReactNode } from "react";

interface ResizablePaneProps {
  children: ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
  onResize?: (width: number) => void;
}

export function ResizablePane({
  children,
  defaultWidth = 288,
  minWidth = 200,
  maxWidth = 500,
  className = "",
  onResize,
}: ResizablePaneProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const paneRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startXRef.current;
      const newWidth = Math.min(
        Math.max(startWidthRef.current + deltaX, minWidth),
        maxWidth
      );

      setWidth(newWidth);
      onResize?.(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, minWidth, maxWidth, onResize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    setIsResizing(true);
  };

  return (
    <div
      ref={paneRef}
      className={`relative flex flex-col h-full ${className}`}
      style={{ width: `${width}px`, flexShrink: 0 }}
    >
      {children}

      {/* Resize Handle */}
      <div
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-400 bg-gray-300 transition-colors"
        onMouseDown={handleMouseDown}
        style={{ transform: "translateX(50%)", zIndex: 10 }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-1 h-8 bg-gray-400 rounded-full" />
        </div>
      </div>
    </div>
  );
}

interface ResizableRightPaneProps {
  children: ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
  onResize?: (width: number) => void;
}

export function ResizableRightPane({
  children,
  defaultWidth = 384,
  minWidth = 300,
  maxWidth = 600,
  className = "",
  onResize,
}: ResizableRightPaneProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const paneRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = startXRef.current - e.clientX;
      const newWidth = Math.min(
        Math.max(startWidthRef.current + deltaX, minWidth),
        maxWidth
      );

      setWidth(newWidth);
      onResize?.(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, minWidth, maxWidth, onResize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    setIsResizing(true);
  };

  return (
    <div
      ref={paneRef}
      className={`relative flex flex-col h-full ${className}`}
      style={{ width: `${width}px`, flexShrink: 0 }}
    >
      {/* Resize Handle */}
      <div
        className="absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-blue-400 bg-gray-300 transition-colors"
        onMouseDown={handleMouseDown}
        style={{ transform: "translateX(-50%)", zIndex: 10 }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-1 h-8 bg-gray-400 rounded-full" />
        </div>
      </div>

      {children}
    </div>
  );
}