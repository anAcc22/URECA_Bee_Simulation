import {
  ScatterChart,
  BarChart,
  Bar,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
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
  densityGraph: GraphData;
  weightGraph: GraphData;
  attachmentGraph: GraphData;
}

export function Graphs({
  widthGraph,
  areaGraph,
  densityGraph,
  weightGraph,
  attachmentGraph,
}: Props) {
  return (
    <>
      <div
        className="absolute top-0 left-0 z-50 flex p-5 font-spacemono w-4/5
          overflow-scroll text-sm no-scrollbar"
      >
        <ResponsiveContainer minWidth={500} height={300}>
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
                value: "Diameter (millipixels)",
                dx: -35,
                angle: -90,
                fontSize: 15,
              }}
              type="number"
              dataKey="y"
              name="y"
              unit=""
            />
            <ZAxis type="number" range={[50]} />
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

        <ResponsiveContainer minWidth={500} height={300}>
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
                value: "Area (millipixels²)",
                dx: -35,
                angle: -90,
                fontSize: 15,
              }}
              type="number"
              dataKey="y"
              name="y"
              unit=""
            />
            <ZAxis type="number" range={[50]} />
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

        <ResponsiveContainer minWidth={500} height={300}>
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
                value: "ρ (g/pixels³)",
                dx: -35,
                angle: -90,
                fontSize: 15,
              }}
              type="number"
              dataKey="y"
              name="y"
              unit=""
            />
            <ZAxis type="number" range={[50]} />
            <Scatter
              name="Data"
              data={densityGraph}
              fill="#555555"
              line
              isAnimationActive={false}
              shape="circle"
            />
          </ScatterChart>
        </ResponsiveContainer>

        <ResponsiveContainer minWidth={500} height={300}>
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
              label={{ value: "M(z) (g/pixels)", dy: 15, fontSize: 15 }}
              type="number"
              dataKey="x"
              name="x"
              unit=""
              scale="log"
              tickFormatter={(value) =>
                new Intl.NumberFormat("en-US", {
                  notation: "scientific",
                  maximumFractionDigits: 0,
                }).format(value)
              }
              domain={[1, "auto"]}
            />
            <YAxis
              label={{
                value: "W(z) (g pixels/s²)",
                dx: -35,
                angle: -90,
                fontSize: 15,
              }}
              type="number"
              dataKey="y"
              name="y"
              unit=""
              scale="log"
              tickFormatter={(value) =>
                new Intl.NumberFormat("en-US", {
                  notation: "scientific",
                  maximumFractionDigits: 0,
                }).format(value)
              }
              domain={[1, "auto"]}
            />
            <ZAxis type="number" range={[50]} />
            <Scatter
              name="Data"
              data={weightGraph}
              fill="#555555"
              line
              isAnimationActive={false}
              shape="circle"
            />
          </ScatterChart>
        </ResponsiveContainer>

        <ResponsiveContainer minWidth={500} height={300}>
          <BarChart
            margin={{
              top: 25,
              right: 25,
              bottom: 25,
              left: 25,
            }}
            data={attachmentGraph}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              label={{ value: "Attachment Number", dy: 15, fontSize: 15 }}
              type="number"
              dataKey="x"
              name="x"
              unit=""
            />
            <YAxis
              label={{
                value: "Count",
                dx: -20,
                angle: -90,
                fontSize: 15,
              }}
              type="number"
              dataKey="y"
              name="y"
              unit=""
            />
            <ZAxis type="number" range={[50]} />
            <Bar dataKey="y" fill="#555555" isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
