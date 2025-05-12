import { useEffect, useRef, useState } from "react";

const gridRows = 74;
const gridCols = 40;

const gridPath = [
  [45, 5],
  [44, 5],
  [44, 6],
  [43, 6],
  [42, 6],
  [41, 6],
  [40, 6],
  [39, 6],
  [38, 6],
  [37, 6],
  [36, 6],
  [36, 7],
  [36, 8],
  [36, 9],
  [35, 9],
];

export default function CanvasMapPath() {
  const canvasRef = useRef(null);
  const image = useRef(new Image()).current;

  const [start, setStart] = useState("45,5");
  const [end, setEnd] = useState("35,9");

  const canvasWidth = 740;
  const canvasHeight = 400;

  const getBounds = (path) => {
    const ys = path.map(([y]) => y);
    const xs = path.map(([, x]) => x);
    const minY = Math.max(Math.min(...ys) - 2, 0);
    const maxY = Math.min(Math.max(...ys) + 2, gridRows);
    const minX = Math.max(Math.min(...xs) - 2, 0);
    const maxX = Math.min(Math.max(...xs) + 2, gridCols);
    return { minY, maxY, minX, maxX };
  };

  const drawPath = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const { minY, maxY, minX, maxX } = getBounds(gridPath);

    const viewCols = maxX - minX;
    const viewRows = maxY - minY;

    const pxPerCellX = image.width / gridCols;
    const pxPerCellY = image.height / gridRows;

    const srcX = minX * pxPerCellX;
    const srcY = minY * pxPerCellY;
    const srcW = viewCols * pxPerCellX;
    const srcH = viewRows * pxPerCellY;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Preserve aspect ratio
    const aspectSrc = srcW / srcH;
    const aspectDest = canvasWidth / canvasHeight;

    let drawW = canvasWidth;
    let drawH = canvasHeight;

    if (aspectSrc > aspectDest) {
      drawH = canvasWidth / aspectSrc;
    } else {
      drawW = canvasHeight * aspectSrc;
    }

    const offsetX = (canvasWidth - drawW) / 2;
    const offsetY = (canvasHeight - drawH) / 2;

    // Draw cropped + scaled image
    ctx.drawImage(image, srcX, srcY, srcW, srcH, offsetX, offsetY, drawW, drawH);

    // Draw path on top
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "red";

    const scaleX = drawW / viewCols;
    const scaleY = drawH / viewRows;

    const [startY, startX] = gridPath[0];
    ctx.moveTo(
      offsetX + (startX - minX) * scaleX,
      offsetY + (startY - minY) * scaleY
    );

    for (let i = 1; i < gridPath.length; i++) {
      const [y, x] = gridPath[i];
      ctx.lineTo(
        offsetX + (x - minX) * scaleX,
        offsetY + (y - minY) * scaleY
      );
    }

    ctx.stroke();
  };

  useEffect(() => {
    image.src = "/central.jpg";
    image.onload = drawPath;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      className="block mx-auto border border-gray-300"
    />
  );
}
