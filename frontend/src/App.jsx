import { Application, extend } from "@pixi/react";

import MapPath from "./components/MapPath";

export default function App() {
  return (
    <Application width={800} height={600}>
      <MapPath />
    </Application>
  );
}
