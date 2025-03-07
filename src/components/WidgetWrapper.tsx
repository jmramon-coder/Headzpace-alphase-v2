import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useViewport } from '../context/ViewportContext';
import { useWidgetResize } from '../hooks/useWidgetResize';
import { X, GripVertical } from 'lucide-react';
import { getDefaultWidgetPosition, getDefaultWidgetSize } from '../utils/grid';
import { ResizeHandle } from './ResizeHandle';
import { trackEvent, ANALYTICS_EVENTS } from '../utils/analytics';
import type { Widget } from '../types';

interface Props {
  widget: Widget;
  isSelected: boolean;
  onRemove: (id: string) => void;
  onResize: (id: string, size: { width: number; height: number }) => void;
  setHasUnsavedChanges: (value: boolean) => void;
  children: React.ReactNode;
}

export const WidgetWrapper = ({ widget, isSelected, onRemove, onResize, setHasUnsavedChanges, children }: Props) => {
  const { isPanning } = useViewport();
  const { isResizing, handleResizeStart } = useWidgetResize(widget, onResize, setHasUnsavedChanges);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: widget.id,
    data: widget,
    disabled: isResizing || isPanning,
  });

  const defaultPosition = getDefaultWidgetPosition();
  const defaultSize = getDefaultWidgetSize(widget.type);

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    left: widget.position?.x ?? defaultPosition.x,
    top: widget.position?.y ?? defaultPosition.y,
    width: widget.size?.width ?? defaultSize.width,
    height: widget.size?.height ?? defaultSize.height,
  };

  const handleRemove = () => {
    onRemove(widget.id);
  };

  // Track widget interactions
  const handleWidgetInteraction = () => {
    trackEvent(ANALYTICS_EVENTS.WIDGET_INTERACT, {
      widget_type: widget.type,
      action: 'focus'
    });
  };

  return (
    <div
      ref={setNodeRef}
      id={widget.id}
      style={style}
      className={`widget-wrapper absolute shadow-xl rounded-lg overflow-hidden group touch-none ${
        isResizing ? 'select-none' : ''
      } ${isSelected ? [
        'ring-2 ring-indigo-500 dark:ring-cyan-500',
        'after:absolute after:inset-0 after:bg-indigo-500/5 dark:after:bg-cyan-500/5',
        'before:absolute before:inset-0 before:border-2 before:border-dashed before:border-indigo-500/30 dark:before:border-cyan-500/30'
      ].join(' ') : ''} ${
        widget.type === 'media' ? '' : 'bg-white/80 dark:bg-black/30 backdrop-blur-md border border-indigo-200 dark:border-cyan-500/20 hover:border-indigo-500/50 dark:hover:border-cyan-500/50'
      }`}
      onClick={handleWidgetInteraction}
    >
      <div className="h-full relative">
        {/* Floating Controls */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-[52] opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1.5 p-1 bg-white/90 dark:bg-black/50 backdrop-blur-sm rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <button 
              {...attributes}
              {...listeners}
              className="p-1 rounded-md hover:bg-indigo-50 dark:hover:bg-cyan-500/10 cursor-grab active:cursor-grabbing"
              aria-label="Drag to move widget"
            >
              <GripVertical className="w-3.5 h-3.5 text-indigo-500 dark:text-cyan-500" />
            </button>
            <button
              onClick={handleRemove}
              aria-label="Close widget"
              className="p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <X className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
            </button>
          </div>
        </div>
        {/* Main Content */}
        <div className="h-full">
        {children}
        </div>
        <ResizeHandle 
          onResizeStart={handleResizeStart}
          isResizing={isResizing}
          className={`opacity-0 group-hover:opacity-100 transition-opacity z-[51] ${
            widget.type === 'media' ? 'text-white/80' : ''
          }`}
        />
      </div>
    </div>
  );
};