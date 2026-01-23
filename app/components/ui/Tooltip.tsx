import React, { useState, useRef, useEffect } from 'react';
import './ui.css';

export interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  maxWidth?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 300,
  maxWidth = 280,
}) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const targetRef = useRef<HTMLElement>(null);

  const showTooltip = (e: React.MouseEvent) => {
    timeoutRef.current = setTimeout(() => {
      const element = e.currentTarget as HTMLElement;
      if (!element) return; // Guard against null element
      
      const rect = element.getBoundingClientRect();
      setCoords({
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
      setVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {React.cloneElement(children, {
        onMouseEnter: showTooltip,
        onMouseLeave: hideTooltip,
        ref: targetRef,
      })}
      {visible && (
        <div
          className={`ui-tooltip ui-tooltip--${position}`}
          style={{
            position: 'fixed',
            left: `${coords.x}px`,
            top: `${coords.y}px`,
            maxWidth: `${maxWidth}px`,
          }}
        >
          <div className="ui-tooltip__content">{content}</div>
        </div>
      )}
    </>
  );
};
