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

  const [imageLoaded, setImageLoaded] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const getBounds = (path) => {
    const ys = path.map(([y]) => y);
    const xs = path.map(([, x]) => x);
    const minY = Math.max(Math.min(...ys) - 2, 0);
    const maxY = Math.min(Math.max(...ys) + 2, gridRows);
    const minX = Math.max(Math.min(...xs) - 2, 0);
    const maxX = Math.min(Math.max(...xs) + 2, gridCols);
    return { minY, maxY, minX, maxX };
  };

  const toCanvas = ([y, x], minY, minX, scaleX, scaleY, offsetX, offsetY) => [
    offsetX + (x - minX) * scaleX,
    offsetY + (y - minY) * scaleY,
  ];

  const midpoint = ([y1, x1], [y2, x2]) => [(y1 + y2) / 2, (x1 + x2) / 2];

  const adjustWithCurveFactor = (point1, point2, curveFactor) => {
    const [y1, x1] = point1;
    const [y2, x2] = point2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    return [y1 + curveFactor * dy, x1 + curveFactor * dx];
  };

  const drawPath = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { width: canvasWidth, height: canvasHeight } = canvas;

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

    ctx.drawImage(
      image,
      srcX,
      srcY,
      srcW,
      srcH,
      offsetX,
      offsetY,
      drawW,
      drawH
    );

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "red";
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    const scaleX = drawW / viewCols;
    const scaleY = drawH / viewRows;

    let [prevY, prevX] = gridPath[0];
    ctx.moveTo(
      ...toCanvas([prevY, prevX], minY, minX, scaleX, scaleY, offsetX, offsetY)
    );

    const curveFactor = 0.6;

    for (let i = 1; i < gridPath.length - 1; i++) {
      const [currY, currX] = gridPath[i];
      const [nextY, nextX] = gridPath[i + 1];

      const dx1 = currX - prevX;
      const dy1 = currY - prevY;
      const dx2 = nextX - currX;
      const dy2 = nextY - currY;

      const isCorner = dx1 !== dx2 || dy1 !== dy2;

      if (isCorner) {
        const prevMid = midpoint([prevY, prevX], [currY, currX]);
        const nextMid = midpoint([currY, currX], [nextY, nextX]);

        const prevAdjusted = adjustWithCurveFactor(
          prevMid,
          [currY, currX],
          curveFactor
        );
        const nextAdjusted = adjustWithCurveFactor(
          nextMid,
          [currY, currX],
          curveFactor
        );

        ctx.lineTo(
          ...toCanvas(prevAdjusted, minY, minX, scaleX, scaleY, offsetX, offsetY)
        );
        ctx.quadraticCurveTo(
          ...toCanvas([currY, currX], minY, minX, scaleX, scaleY, offsetX, offsetY),
          ...toCanvas(nextAdjusted, minY, minX, scaleX, scaleY, offsetX, offsetY)
        );
      } else {
        ctx.lineTo(
          ...toCanvas([currY, currX], minY, minX, scaleX, scaleY, offsetX, offsetY)
        );
      }

      [prevY, prevX] = [currY, currX];
    }

    ctx.lineTo(
      ...toCanvas(gridPath[gridPath.length - 1], minY, minX, scaleX, scaleY, offsetX, offsetY)
    );

    ctx.stroke();
  };

  useEffect(() => {
    image.src = "/central.jpg"; // update to your actual path
    image.onload = () => {
      setImageLoaded(true);
      drawPath();
    };
    image.onerror = () => {
      console.error("Failed to load image");
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (imageLoaded) {
      drawPath();
    }
  }, [dimensions, imageLoaded]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
