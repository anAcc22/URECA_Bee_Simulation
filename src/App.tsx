import { ControlPanel } from "./components/ControlPanel";
import { Simulation } from "./components/Simulation";
import { Graphs } from "./components/Graphs";
import { Status } from "./types";
import { useState } from "react";

interface DataPoint {
  x: number;
  y: number;
}

type GraphData = DataPoint[];

export default function App() {
  const [status, setStatus] = useState<Status>("reset");
  const [beeCnt, setBeeCnt] = useState<number>(0);

  const [showBodyOnly, setShowBodyOnly] = useState<boolean>(
    localStorage.getItem("showBodyOnly")
      ? localStorage.getItem("showBodyOnly")! === "true"
      : false,
  );

  const [alpha, setAlpha] = useState<number>(
    localStorage.getItem("alpha")
      ? Number.parseFloat(localStorage.getItem("alpha")!)
      : 0.0,
  );
  const [beta, setBeta] = useState<number>(
    localStorage.getItem("beta")
      ? Number.parseFloat(localStorage.getItem("alpha")!)
      : 0.0,
  );

  const [widthGraph, setWidthGraph] = useState<GraphData>([{ x: 0, y: 0 }]);
  const [areaGraph, setAreaGraph] = useState<GraphData>([{ x: 0, y: 0 }]);
  const [densityGraph, setDensityGraph] = useState<GraphData>([{ x: 0, y: 0 }]);
  const [weightGraph, setWeightGraph] = useState<GraphData>([{ x: 1, y: 1 }]);
  const [attachmentGraph, setAttachmentGraph] = useState<GraphData>([
    { x: 0, y: 0 },
  ]);

  return (
    <>
      <Graphs
        widthGraph={widthGraph}
        areaGraph={areaGraph}
        densityGraph={densityGraph}
        weightGraph={weightGraph}
        attachmentGraph={attachmentGraph}
      ></Graphs>
      <ControlPanel
        status={status}
        setStatus={setStatus}
        beeCnt={beeCnt}
        showBodyOnly={showBodyOnly}
        setShowBodyOnly={setShowBodyOnly}
        alpha={alpha}
        setAlpha={setAlpha}
        beta={beta}
        setBeta={setBeta}
      ></ControlPanel>
      <Simulation
        status={status}
        setBeeCnt={setBeeCnt}
        showBodyOnly={showBodyOnly}
        alpha={alpha}
        beta={beta}
        setWidthGraph={setWidthGraph}
        setAreaGraph={setAreaGraph}
        setDensityGraph={setDensityGraph}
        setWeightGraph={setWeightGraph}
        setAttachmentGraph={setAttachmentGraph}
      ></Simulation>
    </>
  );
}
