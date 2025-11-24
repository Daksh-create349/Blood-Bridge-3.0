
import React, { useEffect, useState, useRef } from 'react';

export const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailingRef = useRef<HTMLDivElement>(null);

  // To track the trailing circle independently for smooth animation
  const cursorPosition = useRef({ x: 0, y: 0 });
  const trailingPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Check if device supports hover (mouse)
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) return; 

    const onMouseMove = (e: MouseEvent) => {
      cursorPosition.current = { x: e.clientX, y: e.clientY };
      setPosition({ x: e.clientX, y: e.clientY });
      
      if (!isVisible) setIsVisible(true);
    };

    const onMouseDown = () => {
      if (cursorRef.current) cursorRef.current.classList.add('scale-75');
      if (trailingRef.current) trailingRef.current.classList.add('scale-50', 'opacity-50');
    };

    const onMouseUp = () => {
      if (cursorRef.current) cursorRef.current.classList.remove('scale-75');
      if (trailingRef.current) trailingRef.current.classList.remove('scale-50', 'opacity-50');
    };

    // Animation Loop for the trailing effect
    let requestRef: number;
    const animateTrailing = () => {
      const dx = cursorPosition.current.x - trailingPosition.current.x;
      const dy = cursorPosition.current.y - trailingPosition.current.y;
      
      // Ease factor (0.1 = slow lag, 0.9 = fast)
      trailingPosition.current.x += dx * 0.15; 
      trailingPosition.current.y += dy * 0.15;

      if (trailingRef.current) {
        trailingRef.current.style.transform = `translate(${trailingPosition.current.x}px, ${trailingPosition.current.y}px) translate(-50%, -50%)`;
      }
      
      requestRef = requestAnimationFrame(animateTrailing);
    };
    requestRef = requestAnimationFrame(animateTrailing);

    // Hover Detection Logic
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('cursor-pointer');

      setIsHovering(!!isInteractive);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(requestRef);
    };
  }, [isVisible]);

  // Don't render on touch devices or before first movement
  if (typeof window !== 'undefined' && window.matchMedia("(pointer: coarse)").matches) return null;

  return (
    <>
      {/* Main Cursor Dot (Instant) */}
      <div 
        ref={cursorRef}
        className={`fixed top-0 left-0 w-2.5 h-2.5 bg-red-600 rounded-full pointer-events-none z-[9999] transition-opacity duration-300 mix-blend-difference shadow-[0_0_10px_rgba(220,38,38,0.8)] ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)` 
        }}
      />

      {/* Trailing Ring (Smooth Lag) */}
      <div 
        ref={trailingRef}
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-[9998] border-[1.5px] transition-all duration-300 ease-out ${
          isHovering 
            ? 'w-10 h-10 border-red-500 bg-red-500/10' 
            : 'w-6 h-6 border-red-500/40'
        } ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      />
    </>
  );
};
