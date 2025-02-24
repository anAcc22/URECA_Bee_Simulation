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

type Graphs = GraphData[];

interface GraphsOverall {
  widthGraphs: Graphs;
  densityGraphs: Graphs;
  weightGraphs: Graphs;
  attachmentGraphs: Graphs;
  points: GraphData;
}

export default function App() {
  const [status, setStatus] = useState<Status>("reset");
  const [beeCnt, setBeeCnt] = useState<number>(0);
  const [maxBeeCnt, setMaxBeeCnt] = useState<number>(
    parseInt(
      localStorage.getItem("maxBeeCnt")
        ? localStorage.getItem("maxBeeCnt")!
        : "300",
    ),
  );

  const [showBodyOnly, setShowBodyOnly] = useState<boolean>(
    localStorage.getItem("showBodyOnly")
      ? localStorage.getItem("showBodyOnly")! === "true"
      : false,
  );

  const [imageLink, setImageLink] = useState<string>("");

  const [alpha, setAlpha] = useState<number>(
    localStorage.getItem("alpha")
      ? Number.parseFloat(localStorage.getItem("alpha")!)
      : 0.0,
  );
  const [beta, setBeta] = useState<number>(
    localStorage.getItem("beta")
      ? Number.parseFloat(localStorage.getItem("beta")!)
      : 0.0,
  );

  const [sizeDelta, setSizeDelta] = useState<number>(
    localStorage.getItem("sizeDelta")
      ? Number.parseFloat(localStorage.getItem("sizeDelta")!)
      : 0.0,
  );
  const [massDelta, setMassDelta] = useState<number>(
    localStorage.getItem("massDelta")
      ? Number.parseFloat(localStorage.getItem("massDelta")!)
      : 0.0,
  );

  const [widthGraph, setWidthGraph] = useState<GraphData>([{ x: 0, y: 0 }]);
  const [densityGraph, setDensityGraph] = useState<GraphData>([{ x: 0, y: 0 }]);
  const [weightGraph, setWeightGraph] = useState<GraphData>([{ x: 1, y: 1 }]);
  const [attachmentGraph, setAttachmentGraph] = useState<GraphData>([
    { x: 0, y: 0 },
  ]);

  const [graphsOverall, setGraphsOverall] = useState<GraphsOverall>({
    widthGraphs: [],
    densityGraphs: [],
    weightGraphs: [],
    attachmentGraphs: [],
    points: [],
  });

  return (
    <>
      <Graphs
        widthGraph={widthGraph}
        densityGraph={densityGraph}
        weightGraph={weightGraph}
        attachmentGraph={attachmentGraph}
      ></Graphs>
      <ControlPanel
        imageLink={imageLink}
        status={status}
        setStatus={setStatus}
        beeCnt={beeCnt}
        maxBeeCnt={maxBeeCnt}
        setMaxBeeCnt={setMaxBeeCnt}
        showBodyOnly={showBodyOnly}
        setShowBodyOnly={setShowBodyOnly}
        alpha={alpha}
        setAlpha={setAlpha}
        beta={beta}
        setBeta={setBeta}
        sizeDelta={sizeDelta}
        setSizeDelta={setSizeDelta}
        massDelta={massDelta}
        setMassDelta={setMassDelta}
        graphsOverall={graphsOverall}
      ></ControlPanel>
      <Simulation
        setImageLink={setImageLink}
        status={status}
        setBeeCnt={setBeeCnt}
        maxBeeCnt={maxBeeCnt}
        showBodyOnly={showBodyOnly}
        alpha={alpha}
        beta={beta}
        sizeDelta={sizeDelta}
        massDelta={massDelta}
        setWidthGraph={setWidthGraph}
        setDensityGraph={setDensityGraph}
        setWeightGraph={setWeightGraph}
        setAttachmentGraph={setAttachmentGraph}
        setGraphsOverall={setGraphsOverall}
      ></Simulation>
    </>
  );
}
