import React from 'react';

const coordinates = [
    { x: 100, y: 100 },
    { x: 200, y: 150 },
    { x: 300, y: 100 },
    { x: 400, y: 200 },
    { x: 500, y: 250 },
];

const backgroundImage = '/map.png'; // Replace with your actual image path

function MapPath() {
    const draw = (g) => {
        g.clear();
        g.lineStyle(4, 0xff0000, 1);

        if (coordinates.length > 1) {
            g.moveTo(coordinates[0].x, coordinates[0].y);

            for (let i = 1; i < coordinates.length - 1; i++) {
                const xc = (coordinates[i].x + coordinates[i + 1].x) / 2;
                const yc = (coordinates[i].y + coordinates[i + 1].y) / 2;
                g.quadraticCurveTo(coordinates[i].x, coordinates[i].y, xc, yc);
            }

            g.lineTo(coordinates[coordinates.length - 1].x, coordinates[coordinates.length - 1].y);
        }
    };

    return (
        <>
            <pixiSprite image={backgroundImage} x={0} y={0} width={800} height={600} />
            <pixiGraphics draw={draw} />
        </>
    );
}
export default MapPath;