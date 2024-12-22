import { useRef } from "react";
import { useEffect } from "react";

import { Status } from "../types";

import { resizeSimulation } from "./simulation";
import { setSimulationStatus } from "./simulation";
import { initSimulation } from "./simulation";
import { updateSetBeeCnt } from "./simulation";

interface Props {
  status: Status;
  setBeeCnt: React.Dispatch<React.SetStateAction<number>>;
}

export function Simulation({ status, setBeeCnt }: Props) {
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

    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => setSimulationStatus(status), [status]);

  return (
    <>
      <canvas
        ref={ref}
        className="absolute z-0 w-full h-full bg-gray-50 active:cursor-pointer"
      ></canvas>
    </>
  );
}
