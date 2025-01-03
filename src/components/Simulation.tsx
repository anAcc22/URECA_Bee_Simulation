import { useRef } from "react";
import { useEffect } from "react";

import { Status } from "../types";

import { resizeSimulation } from "./simulation";
import { setSimulationStatus, setSimulationAlphaBeta } from "./simulation";
import { initSimulation } from "./simulation";
import { updateSetBeeCnt } from "./simulation";

import { updateSetWidthGraph } from "./simulation";
import { updateSetAreaGraph } from "./simulation";
import { updateSetDensityGraph } from "./simulation";
import { updateSetWeightGraph } from "./simulation";
import { updateSetAttachmentGraph } from "./simulation";

import { setShowBodyOnly } from "./simulation";

interface DataPoint {
  x: number;
  y: number;
}

type GraphData = DataPoint[];

interface Props {
  status: Status;
  setBeeCnt: React.Dispatch<React.SetStateAction<number>>;
  showBodyOnly: boolean;
  alpha: number;
  beta: number;
  setWidthGraph: React.Dispatch<React.SetStateAction<GraphData>>;
  setAreaGraph: React.Dispatch<React.SetStateAction<GraphData>>;
  setDensityGraph: React.Dispatch<React.SetStateAction<GraphData>>;
  setWeightGraph: React.Dispatch<React.SetStateAction<GraphData>>;
  setAttachmentGraph: React.Dispatch<React.SetStateAction<GraphData>>;
}

export function Simulation({
  status,
  setBeeCnt,
  showBodyOnly,
  alpha,
  beta,
  setWidthGraph,
  setAreaGraph,
  setDensityGraph,
  setWeightGraph,
  setAttachmentGraph,
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
    initSimulation(ctx);
    updateSetBeeCnt(setBeeCnt);

    updateSetWidthGraph(setWidthGraph);
    updateSetAreaGraph(setAreaGraph);
    updateSetDensityGraph(setDensityGraph);
    updateSetWeightGraph(setWeightGraph);
    updateSetAttachmentGraph(setAttachmentGraph);

    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => setSimulationStatus(status), [status]);
  useEffect(() => setShowBodyOnly(showBodyOnly), [showBodyOnly]);
  useEffect(() => setSimulationAlphaBeta(alpha, beta), [alpha, beta]);

  return (
    <>
      <canvas
        ref={ref}
        className="absolute z-0 w-full h-full bg-gray-50 active:cursor-pointer"
      ></canvas>
    </>
  );
}
