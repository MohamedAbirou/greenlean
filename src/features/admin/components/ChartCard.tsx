import classNames from 'classnames';
import React from 'react';

const ChartCard: React.FC<{
  title: string;
  canvasRef?: React.Ref<HTMLCanvasElement>;
  className?: string;
}> = ({ title, canvasRef, className }) => (
  <div className={classNames("p-6 rounded-md bg-card", className)}>
    <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>
    <canvas ref={canvasRef}></canvas>
  </div>
);

export default ChartCard;