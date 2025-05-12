// App.tsx
import { Application, extend } from "@pixi/react";
import { Container, Graphics, Sprite } from "pixi.js";

import Map from "./components/Map";

// extend tells @pixi/react what Pixi.js components are available
extend({
  Container,
  Graphics,
  Sprite,
});

export default function App() {
  return (
    // <Application width={window.innerWidth} height={window.innerHeight} antialias backgroundAlpha={1}>
    <Map />
    // </Application>
  );
}
