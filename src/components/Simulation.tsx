import { useRef } from "react";
import { useEffect } from "react";

import { Status } from "../types";

import { resizeSimulation } from "./simulation";
import {
  setSimulationStatus,
  setSimulationAlphaBeta,
  setSimulationMaxBeeCnt,
} from "./simulation";
import { setSimulationSizeDelta, setSimulationMassDelta } from "./simulation";
import { initSimulation } from "./simulation";
import { updateSetBeeCnt } from "./simulation";

import { updateSetWidthGraph } from "./simulation";
import { updateSetDensityGraph } from "./simulation";
import { updateSetWeightGraph } from "./simulation";
import { updateSetAttachmentGraph } from "./simulation";

import { updateSetGraphsOverall } from "./simulation";

import { setShowBodyOnly } from "./simulation";

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
}

interface Props {
  setImageLink: React.Dispatch<React.SetStateAction<string>>;
  status: Status;
  setBeeCnt: React.Dispatch<React.SetStateAction<number>>;
  maxBeeCnt: number;
  showBodyOnly: boolean;
  alpha: number;
  beta: number;
  sizeDelta: number;
  massDelta: number;
  setWidthGraph: React.Dispatch<React.SetStateAction<GraphData>>;
  setDensityGraph: React.Dispatch<React.SetStateAction<GraphData>>;
  setWeightGraph: React.Dispatch<React.SetStateAction<GraphData>>;
  setAttachmentGraph: React.Dispatch<React.SetStateAction<GraphData>>;
  setGraphsOverall: React.Dispatch<React.SetStateAction<GraphsOverall>>;
}

export function Simulation({
  setImageLink,
  status,
  setBeeCnt,
  maxBeeCnt,
  showBodyOnly,
  alpha,
  beta,
  sizeDelta,
  massDelta,
  setWidthGraph,
  setDensityGraph,
  setWeightGraph,
  setAttachmentGraph,
  setGraphsOverall,
}: Props) {
  let ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let canvas = ref.current;

    if (canvas === null) {
      return;
    }

    let ctx = canvas.getContext("2d");

    if (ctx === null) {
      return;
    }

    const resize = (): void => {
      const pixelRatio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      const width = pixelRatio * rect.width;
      const height = pixelRatio * rect.height;

      canvas.width = width;
      canvas.height = height;

      ctx.scale(pixelRatio, pixelRatio);

      resizeSimulation(rect.width, rect.height);
    };

    resize();
    initSimulation(canvas, ctx, setImageLink);
    updateSetBeeCnt(setBeeCnt);

    updateSetWidthGraph(setWidthGraph);
    updateSetDensityGraph(setDensityGraph);
    updateSetWeightGraph(setWeightGraph);
    updateSetAttachmentGraph(setAttachmentGraph);
    updateSetGraphsOverall(setGraphsOverall);

    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => setSimulationStatus(status), [status]);
  useEffect(() => setShowBodyOnly(showBodyOnly), [showBodyOnly]);
  useEffect(() => setSimulationAlphaBeta(alpha, beta), [alpha, beta]);
  useEffect(() => setSimulationSizeDelta(sizeDelta), [sizeDelta]);
  useEffect(() => setSimulationMassDelta(massDelta), [massDelta]);
  useEffect(() => setSimulationMaxBeeCnt(maxBeeCnt), [maxBeeCnt]);

  return (
    <>
      <canvas
        ref={ref}
        className="absolute z-0 w-full h-full bg-gray-50 active:cursor-pointer"
      ></canvas>
    </>
  );
}
