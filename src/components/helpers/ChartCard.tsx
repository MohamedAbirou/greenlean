import React from 'react';

const ChartCard: React.FC<{ title: string; canvasRef: React.RefObject<HTMLCanvasElement> }> = ({ title, canvasRef }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
    <h3 className="text-lg font-semibold mb-4 dark:text-white">{title}</h3>
    <canvas ref={canvasRef}></canvas>
  </div>
);

export default ChartCard;