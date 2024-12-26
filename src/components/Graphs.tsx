import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  x: number;
  y: number;
}

type GraphData = DataPoint[];

interface Props {
  widthGraph: GraphData;
  areaGraph: GraphData;
}

export function Graphs({ widthGraph, areaGraph }: Props) {
  return (
    <>
      <div className="absolute top-0 left-0 z-50 flex p-5 font-spacemono text-sm">
        <ResponsiveContainer width={500} height={300}>
          <ScatterChart
            margin={{
              top: 25,
              right: 25,
              bottom: 25,
              left: 25,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              label={{ value: "z (millipixels)", dy: 15, fontSize: 15 }}
              type="number"
              dataKey="x"
              name="x"
              unit=""
            />
            <YAxis
              label={{
                value: "width (millipixels)",
                dx: -30,
                angle: -90,
                fontSize: 15,
              }}
              type="number"
              dataKey="y"
              name="y"
              unit=""
            />
            <ZAxis type="number" range={[50]} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter
              name="Data"
              data={widthGraph}
              fill="#555555"
              line
              isAnimationActive={false}
              shape="circle"
            />
          </ScatterChart>
        </ResponsiveContainer>

        <ResponsiveContainer width={500} height={300}>
          <ScatterChart
            margin={{
              top: 25,
              right: 25,
              bottom: 25,
              left: 25,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              label={{ value: "z (millipixels)", dy: 15, fontSize: 15 }}
              type="number"
              dataKey="x"
              name="x"
              unit=""
            />
            <YAxis
              label={{
                value: "area (millipixels²)",
                dx: -30,
                angle: -90,
                fontSize: 15,
              }}
              type="number"
              dataKey="y"
              name="y"
              unit=""
            />
            <ZAxis type="number" range={[50]} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter
              name="Data"
              data={areaGraph}
              fill="#555555"
              line
              isAnimationActive={false}
              shape="circle"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
