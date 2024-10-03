import { ControlPanel } from "./components/ControlPanel";
import { Simulation } from "./components/Simulation";
import { Status } from "./types";
import { useState } from "react";

export default function App() {
  const [status, setStatus] = useState<Status>("reset");

  return (
    <>
      <ControlPanel status={status} setStatus={setStatus}></ControlPanel>
      <Simulation status={status}></Simulation>
    </>
  );
}
