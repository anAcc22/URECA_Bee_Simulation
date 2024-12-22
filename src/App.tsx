import { ControlPanel } from "./components/ControlPanel";
import { Simulation } from "./components/Simulation";
import { Status } from "./types";
import { useState } from "react";

export default function App() {
  const [status, setStatus] = useState<Status>("reset");
  const [beeCnt, setBeeCnt] = useState<number>(0);
  const [showBodyOnly, setShowBodyOnly] = useState<boolean>(false);

  return (
    <>
      <ControlPanel
        status={status}
        setStatus={setStatus}
        beeCnt={beeCnt}
        showBodyOnly={showBodyOnly}
        setShowBodyOnly={setShowBodyOnly}
      ></ControlPanel>
      <Simulation status={status} setBeeCnt={setBeeCnt} showBodyOnly={showBodyOnly}></Simulation>
    </>
  );
}
