import { useRef, useState } from "react";
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
  const stageRef = useRef();
  const layerRef = useRef();
  const [image] = useImage("/central.jpg"); // replace with your image path
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const imageWidth = 740; // 40 cols
  const imageHeight = 1384; // 74 rows

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setScale(newScale);
    setPosition({
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
    });
  };

  const toPixels = ([y, x]) => [
    (x / gridCols) * imageWidth,
    (y / gridRows) * imageHeight,
  ];

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
              ctx.quadraticCurveTo(
                ...toPixels(curr),
                ...toPixels(nextCtrl)
              );
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
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
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
  );
}
