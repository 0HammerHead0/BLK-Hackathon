import Map from "./components/Map";
import KonvaMap from "./components/KonvaMap";

export default function App() {
  return (
    // <Application width={window.innerWidth} height={window.innerHeight} antialias backgroundAlpha={1}>
    // <Map />
    <div style={{ width: "100vw", height: "100vh" }}>
      <KonvaMap />
    </div>

    // </Application>
  );
}
