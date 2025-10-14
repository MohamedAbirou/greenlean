import classNames from 'classnames';
import React from 'react';

const ChartCard: React.FC<{
  title: string;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  className?: string;
}> = ({ title, canvasRef, className }) => (
  <div className={classNames("p-6 rounded-md shadow-sm bg-white dark:bg-gray-800", className)}>
    <h3 className="text-lg font-semibold mb-4 dark:text-white">{title}</h3>
    <canvas ref={canvasRef}></canvas>
  </div>
);

export default ChartCard;