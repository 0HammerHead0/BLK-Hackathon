import { useRef, useState, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage, Shape } from "react-konva";
import useImage from "use-image";

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

export default function KonvaMapPath() {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const layerRef = useRef(null);
  const [image] = useImage("/central.jpg");

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const imageWidth = 740;
  const imageHeight = 1384;
  const buffer = 10;

  const toPixels = ([y, x]) => [
    (x / gridCols) * imageWidth,
    (y / gridRows) * imageHeight,
  ];

  // Resize observer to detect parent size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setContainerSize({ width: clientWidth, height: clientHeight });
      }
    };
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

useEffect(() => {
  if (!image || !containerSize.width || !containerSize.height) return;

  const pixelPoints = gridPath.map(toPixels);
  const xs = pixelPoints.map(p => p[0]);
  const ys = pixelPoints.map(p => p[1]);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const pathWidth = maxX - minX;
  const pathHeight = maxY - minY;

  const stageWidth = containerSize.width - 2 * buffer;
  const stageHeight = containerSize.height - 2 * buffer;

  const scaleX = stageWidth / pathWidth;
  const scaleY = stageHeight / pathHeight;
  const finalScale = Math.min(scaleX, scaleY);

  const offsetX = -minX * finalScale + (containerSize.width - pathWidth * finalScale) / 2;
  const offsetY = -minY * finalScale + (containerSize.height - pathHeight * finalScale) / 2;

  setScale(finalScale);
  setPosition({ x: offsetX, y: offsetY });

  // ⬇️ Manually set stage position for immediate re-center
  if (stageRef.current) {
    stageRef.current.position({ x: offsetX, y: offsetY });
    stageRef.current.scale({ x: finalScale, y: finalScale });
    stageRef.current.batchDraw();
  }
}, [image, containerSize]);


  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: pointer.x / oldScale - stage.x() / oldScale,
      y: pointer.y / oldScale - stage.y() / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setScale(newScale);
    setPosition({
      x: -(mousePointTo.x - pointer.x / newScale) * newScale,
      y: -(mousePointTo.y - pointer.y / newScale) * newScale,
    });
  };

  const renderCurvedPath = () => {
    const curveFactor = 0.4;

    const midpoint = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const adjust = (mid, corner, factor) => [
      mid[0] + factor * (corner[0] - mid[0]),
      mid[1] + factor * (corner[1] - mid[1]),
    ];

    return (
      <Shape
        sceneFunc={(ctx, shape) => {
          ctx.beginPath();
          const [startY, startX] = gridPath[0];
          ctx.moveTo(...toPixels([startY, startX]));

          for (let i = 1; i < gridPath.length - 1; i++) {
            const prev = gridPath[i - 1];
            const curr = gridPath[i];
            const next = gridPath[i + 1];

            const dx1 = curr[1] - prev[1];
            const dy1 = curr[0] - prev[0];
            const dx2 = next[1] - curr[1];
            const dy2 = next[0] - curr[0];

            const isCorner = dx1 !== dx2 || dy1 !== dy2;

            if (isCorner) {
              const prevMid = midpoint(prev, curr);
              const nextMid = midpoint(curr, next);
              const prevCtrl = adjust(prevMid, curr, curveFactor);
              const nextCtrl = adjust(nextMid, curr, curveFactor);

              ctx.lineTo(...toPixels(prevCtrl));
              ctx.quadraticCurveTo(...toPixels(curr), ...toPixels(nextCtrl));
            } else {
              ctx.lineTo(...toPixels(curr));
            }
          }

          ctx.lineTo(...toPixels(gridPath[gridPath.length - 1]));
          ctx.strokeShape(shape);
        }}
        stroke="red"
        strokeWidth={2 / scale}
        lineJoin="round"
        lineCap="round"
      />
    );
  };

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative" }}>
      <Stage
        width={containerSize.width}
        height={containerSize.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onWheel={handleWheel}
        draggable
        ref={stageRef}
      >
        <Layer ref={layerRef}>
          {image && (
            <KonvaImage image={image} width={imageWidth} height={imageHeight} />
          )}
          {renderCurvedPath()}
        </Layer>
      </Stage>
    </div>
  );
}
