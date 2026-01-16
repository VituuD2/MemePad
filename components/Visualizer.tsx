import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  analyserNode: AnalyserNode | null;
}

export const Visualizer: React.FC<VisualizerProps> = ({ analyserNode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!analyserNode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyserNode.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw LED bars
      const bars = 16; 
      const barWidth = (canvas.width / bars) - 2;
      
      for (let i = 0; i < bars; i++) {
        // Map the lower frequencies more to the left
        const dataIndex = Math.floor((i / bars) * (bufferLength / 2)); 
        const value = dataArray[dataIndex];
        const percent = value / 255;
        const barHeight = percent * canvas.height;

        // Gradient for LED look
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, '#00ffcc'); // bright cyan
        gradient.addColorStop(0.6, '#0099ff'); // blue
        gradient.addColorStop(1, '#ff00ff'); // magenta peak

        ctx.fillStyle = gradient;
        
        // Draw segment style
        const segmentHeight = 4;
        const totalSegments = Math.floor(barHeight / (segmentHeight + 1));
        
        for (let j = 0; j < totalSegments; j++) {
            const y = canvas.height - (j * (segmentHeight + 1)) - segmentHeight;
            ctx.fillRect(i * (barWidth + 2), y, barWidth, segmentHeight);
        }
        
        // Draw peak "ghost" (simple glow at bottom)
        ctx.fillStyle = `rgba(0, 255, 204, 0.1)`;
        ctx.fillRect(i * (barWidth + 2), 0, barWidth, canvas.height);
      }
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [analyserNode]);

  return (
    <div className="w-full h-12 bg-black border-b border-gray-800 rounded-t-lg overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
        <canvas ref={canvasRef} width={300} height={50} className="w-full h-full" />
    </div>
  );
};