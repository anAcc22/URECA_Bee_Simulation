import { Status } from "../types";

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
  imageLink: string;
  status: Status;
  setStatus: React.Dispatch<React.SetStateAction<Status>>;
  beeCnt: number;
  maxBeeCnt: number;
  setMaxBeeCnt: React.Dispatch<React.SetStateAction<number>>;
  showBodyOnly: boolean;
  setShowBodyOnly: React.Dispatch<React.SetStateAction<boolean>>;
  alpha: number;
  setAlpha: React.Dispatch<React.SetStateAction<number>>;
  beta: number;
  setBeta: React.Dispatch<React.SetStateAction<number>>;
  sizeDelta: number;
  setSizeDelta: React.Dispatch<React.SetStateAction<number>>;
  massDelta: number;
  setMassDelta: React.Dispatch<React.SetStateAction<number>>;
  graphsOverall: GraphsOverall;
}

export function ControlPanel({
  imageLink,
  status,
  setStatus,
  beeCnt,
  maxBeeCnt,
  setMaxBeeCnt,
  showBodyOnly,
  setShowBodyOnly,
  alpha,
  setAlpha,
  beta,
  setBeta,
  sizeDelta,
  setSizeDelta,
  massDelta,
  setMassDelta,
  graphsOverall,
}: Props) {
  return (
    <>
      <div
        className="absolute sm:right-0 sm:top-0 lg:right-5 lg:top-5 z-10 flex
          w-72 flex-col justify-between gap-2 rounded-lg border-2
          border-gray-100 bg-gray-100 p-2.5 font-spacemono shadow-md
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

        <div className="flex justify-between">
          <div>
            <span className="text-md font-semibold">Crawl Rate: </span>
            <span>{alpha}</span>
          </div>
          <div className="flex gap-1 font-semibold">
            <button
              className="bg-gray-500 text-white w-6 rounded-full
                hover:bg-gray-400 active:bg-amber-300"
              onClick={() => {
                const newVal = Math.round(10 * Math.max(0.0, alpha - 0.1)) / 10;
                setAlpha(newVal);
                localStorage.setItem("alpha", newVal.toString());
              }}
            >
              −
            </button>
            <button
              className="bg-gray-500 text-white w-6 rounded-full
                hover:bg-gray-400 active:bg-amber-300"
              onClick={() => {
                const newVal = Math.round(10 * Math.min(1.0, alpha + 0.1)) / 10;
                setAlpha(newVal);
                localStorage.setItem("alpha", newVal.toString());
              }}
            >
              +
            </button>
          </div>
        </div>

        <div className="flex justify-between">
          <div>
            <span className="text-md font-semibold">Climb Rate: </span>
            <span>{beta}</span>
          </div>
          <div className="flex gap-1 font-semibold">
            <button
              className="bg-gray-500 text-white w-6 rounded-full
                hover:bg-gray-400 active:bg-amber-300"
              onClick={() => {
                const newVal = Math.round(10 * Math.max(0.0, beta - 0.1)) / 10;
                setBeta(newVal);
                localStorage.setItem("beta", newVal.toString());
              }}
            >
              −
            </button>
            <button
              className="bg-gray-500 text-white w-6 rounded-full
                hover:bg-gray-400 active:bg-amber-300"
              onClick={() => {
                const newVal = Math.round(10 * Math.min(1.0, beta + 0.1)) / 10;
                setBeta(newVal);
                localStorage.setItem("beta", newVal.toString());
              }}
            >
              +
            </button>
          </div>
        </div>

        <div className="flex justify-between">
          <div>
            <span className="text-md font-semibold">Size Delta: </span>
            <span>{sizeDelta}</span>
          </div>
          <div className="flex gap-1 font-semibold">
            <button
              className="bg-gray-500 text-white w-6 rounded-full
                hover:bg-gray-400 active:bg-amber-300"
              onClick={() => {
                const newVal =
                  Math.round(100 * Math.max(0.0, sizeDelta - 0.05)) / 100;
                setSizeDelta(newVal);
                localStorage.setItem("sizeDelta", newVal.toString());
              }}
            >
              −
            </button>
            <button
              className="bg-gray-500 text-white w-6 rounded-full
                hover:bg-gray-400 active:bg-amber-300"
              onClick={() => {
                const newVal =
                  Math.round(100 * Math.min(0.5, sizeDelta + 0.05)) / 100;
                setSizeDelta(newVal);
                localStorage.setItem("sizeDelta", newVal.toString());
              }}
            >
              +
            </button>
          </div>
        </div>

        <div className="flex justify-between">
          <div>
            <span className="text-md font-semibold">Mass Delta: </span>
            <span>{massDelta}</span>
          </div>
          <div className="flex gap-1 font-semibold">
            <button
              className="bg-gray-500 text-white w-6 rounded-full
                hover:bg-gray-400 active:bg-amber-300"
              onClick={() => {
                const newVal =
                  Math.round(100 * Math.max(0.0, massDelta - 0.05)) / 100;
                setMassDelta(newVal);
                localStorage.setItem("massDelta", newVal.toString());
              }}
            >
              −
            </button>
            <button
              className="bg-gray-500 text-white w-6 rounded-full
                hover:bg-gray-400 active:bg-amber-300"
              onClick={() => {
                const newVal =
                  Math.round(100 * Math.min(0.5, massDelta + 0.05)) / 100;
                setMassDelta(newVal);
                localStorage.setItem("massDelta", newVal.toString());
              }}
            >
              +
            </button>
          </div>
        </div>

        <div className="flex justify-between">
          <div>
            <span className="text-md font-semibold">Max. Bee Count: </span>
            <textarea
              rows={1}
              cols={4}
              placeholder={maxBeeCnt.toString()}
              className="appearance-none bg-gray-100 resize-none"
              id="textMaxBeeCnt"
            ></textarea>
          </div>
          <button
            className="bg-gray-500 text-white w-12 rounded-full
              hover:bg-gray-400 active:bg-amber-300 font-semibold"
            onClick={() => {
              const newVal = (
                document.getElementById("textMaxBeeCnt") as HTMLTextAreaElement
              ).value;
              if (newVal.length && parseInt(newVal).toString() === newVal) {
                setMaxBeeCnt(parseInt(newVal));
                localStorage.setItem("maxBeeCnt", newVal);
              }
            }}
          >
            SET
          </button>
        </div>

        <div className="flex justify-between">
          <div className="font-semibold">Bee Count</div>
          <div>
            <span>
              {beeCnt}/{maxBeeCnt}
            </span>
          </div>
        </div>

        <div className="flex justify-between">
          <div className="font-semibold">Show Body Only</div>
          <div className="flex gap-1">
            <button
              className={showBodyOnly ? "" : "font-semibold"}
              onClick={() => {
                setShowBodyOnly(false);
                localStorage.setItem("showBodyOnly", "false");
              }}
            >
              No
            </button>
            |
            <button
              className={showBodyOnly ? "font-semibold" : ""}
              onClick={() => {
                setShowBodyOnly(true);
                localStorage.setItem("showBodyOnly", "true");
              }}
            >
              Yes
            </button>
          </div>
        </div>

        <div className="flex justify-between">
          <a
            href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(graphsOverall))}`}
            download={`crawl_${alpha}_climb_${beta}_size_${sizeDelta}_mass_${massDelta}_cnt_${beeCnt}.json`}
            className="hover:cursor-pointer text-amber-700 hover:text-amber-600
              rounded-full"
          >
            Data (JSON)
          </a>
          <a
            download={`crawl_${alpha}_climb_${beta}_size_${sizeDelta}_mass_${massDelta}_cnt_${beeCnt}.png`}
            href={imageLink}
            className="hover:cursor-pointer text-amber-700 hover:text-amber-600
              rounded-full"
          >
            Image (PNG)
          </a>
        </div>
      </div>
    </>
  );
}
