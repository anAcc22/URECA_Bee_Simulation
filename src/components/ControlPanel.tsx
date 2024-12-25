import { Status } from "../types";

interface Props {
  status: Status;
  setStatus: React.Dispatch<React.SetStateAction<Status>>;
  beeCnt: number;
  showBodyOnly: boolean;
  setShowBodyOnly: React.Dispatch<React.SetStateAction<boolean>>;
  alpha: number;
  setAlpha: React.Dispatch<React.SetStateAction<number>>;
  beta: number;
  setBeta: React.Dispatch<React.SetStateAction<number>>;
}

export function ControlPanel({
  status,
  setStatus,
  beeCnt,
  showBodyOnly,
  setShowBodyOnly,
  alpha,
  setAlpha,
  beta,
  setBeta,
}: Props) {
  return (
    <>
      <div
        className="absolute sm:right-0 sm:top-0 lg:right-5 lg:top-5 z-10 flex
          w-72 flex-col justify-between gap-2 rounded-lg border-2
          border-gray-100 bg-gray-100 p-2.5 font-spacemono shadow-lg
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

        <hr className="border-dashed border-gray-200" />

        <h1 className="text-md font-semibold">α (Crawl Rate)</h1>
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={alpha}
          className="range appearance-none outline-none bg-gray-300 h-1 w-full
            self-center rounded-full cursor-ew-resize
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
            [&::-webkit-slider-thumb]:border-gray-500
            [&::-webkit-slider-thumb]:bg-none
            [&::-webkit-slider-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-none [&::-moz-range-thumb]:w-2
            [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:border-gray-500
            [&::-moz-range-thumb]:rounded-full"
          onChange={(e) => {
            setAlpha(Number.parseFloat(e.target.value));
          }}
        />
        <div className="flex justify-between self-center w-full -m-1">
          <div className="w-0">0</div>
          <div className="w-4">0.5</div>
          <div>1</div>
        </div>

        <h1 className="text-md font-semibold">β (Climb Rate)</h1>
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={beta}
          className="range appearance-none outline-none bg-gray-300 h-1 w-full
            self-center rounded-full cursor-ew-resize
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
            [&::-webkit-slider-thumb]:border-gray-500
            [&::-webkit-slider-thumb]:bg-none
            [&::-webkit-slider-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-none [&::-moz-range-thumb]:w-2
            [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:border-gray-500
            [&::-moz-range-thumb]:rounded-full"
          onChange={(e) => {
            setBeta(Number.parseFloat(e.target.value));
          }}
        />
        <div className="flex justify-between self-center w-full -m-1">
          <div className="w-0">0</div>
          <div className="w-4">0.5</div>
          <div>1</div>
        </div>

        <hr className="border-dashed border-gray-200" />

        <div className="flex justify-between">
          <div className="font-semibold">Bee Count</div>
          <div>{beeCnt}</div>
        </div>

        <div className="flex justify-between">
          <div className="font-semibold">Show Body Only</div>
          <div className="flex gap-1">
            <button
              className={showBodyOnly ? "" : "font-semibold"}
              onClick={() => setShowBodyOnly(false)}
            >
              No
            </button>
            |
            <button
              className={showBodyOnly ? "font-semibold" : ""}
              onClick={() => setShowBodyOnly(true)}
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
