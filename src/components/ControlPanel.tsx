import { Status } from "../types";
import { useState } from "react";

interface Props {
  status: Status;
  setStatus: React.Dispatch<React.SetStateAction<Status>>;
  beeCnt: number;
}

export function ControlPanel({ status, setStatus, beeCnt }: Props) {
  return (
    <>
      <div
        className="absolute sm:right-0 sm:top-0 lg:right-10 lg:top-10 z-10 flex
          w-64 flex-col justify-between gap-5 rounded-lg border-2
          border-gray-100 bg-gray-100 p-5 font-spacemono shadow-lg
          hover:border-gray-200"
      >
        <h1 className="text-lg font-bold">Control Panel</h1>
        <div className="flex justify-between">
          <button
            className={
              status === "start"
                ? `bg-green-600 px-2 py-1 shadow-md rounded-md border-2
                  shadow-green-200 border-green-700 text-green-100`
                : `bg-gray-50 border-green-400 px-2 py-1 shadow-md border-2
                  rounded-md shadow-green-200 hover:bg-green-100 text-green-700`
            }
            onClick={() => setStatus("start")}
          >
            Start
          </button>
          <button
            className={
              status === "stop"
                ? `bg-red-600 px-2 py-1 shadow-md rounded-md border-2
                  shadow-red-200 border-red-700 text-red-100`
                : `bg-gray-50 border-red-400 px-2 py-1 shadow-md border-2
                  rounded-md shadow-red-200 hover:bg-red-100 text-red-700`
            }
            onClick={() => setStatus("stop")}
          >
            Stop
          </button>
          <button
            className={
              status === "reset"
                ? `bg-amber-600 px-2 py-1 shadow-md rounded-md border-2
                  shadow-amber-200 border-amber-700 text-amber-100`
                : `bg-gray-50 border-amber-400 px-2 py-1 shadow-md border-2
                  rounded-md shadow-amber-200 hover:bg-amber-100 text-amber-700`
            }
            onClick={() => setStatus("reset")}
          >
            Reset
          </button>
        </div>

        <div className="flex justify-between font-spacemono">
          <div>Bee Count</div>
          <div>{beeCnt}</div>
        </div>
      </div>
    </>
  );
}
