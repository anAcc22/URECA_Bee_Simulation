import { ControlPanel } from "./components/ControlPanel";
import { Simulation } from "./components/Simulation";
import { Status } from "./types";
import { useState } from "react";

export default function App() {
  const [status, setStatus] = useState<Status>("reset");
  const [beeCnt, setBeeCnt] = useState<number>(0);

  const [showBodyOnly, setShowBodyOnly] = useState<boolean>(false);

  const [alpha, setAlpha] = useState<number>(0.0);
  const [beta, setBeta] = useState<number>(0.0);

  return (
    <>
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
      ></Simulation>
    </>
  );
}
