import { type Component, createMemo, For } from "solid-js";
import { arc, interpolateSinebow, interpolateInferno } from "d3";

import { startFromFile, rawData } from "./audioSource";

const arcBuilder = arc();

const RadialGraph: Component<{
  color: (value: number) => string;
  scale: number;
}> = ({ color, scale }) => {
  const computed = createMemo(() => {
    const data = rawData();

    const total = data.reduce((a, v) => a + v, 0);

    const highCount = data.filter((d) => d > 32).length;
    const intensity = highCount / data.length;

    const paths: {
      path: string;
      color: string;
    }[] = [];

    const range = 1.0 + intensity;
    const rangeInRadians = range * Math.PI;
    const startAngle = -(rangeInRadians / 2);
    let currentAngle = startAngle;

    for (const d of data) {
      const angle = rangeInRadians * (d / total);
      const path = arcBuilder({
        innerRadius: 50 - ((d + 10) / 255) * 35,
        outerRadius: 50 + ((d + 10) / 255) * 35,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
      })!;
      paths.push({
        path,
        color: color(d / 255),
      });
      currentAngle += angle;
    }

    return { paths, intensity };
  });
  return (
    <g transform={`scale(${computed().intensity * scale + 1})`}>
      <For each={computed().paths}>
        {(p) => <path d={p.path} fill={p.color} />}
      </For>
    </g>
  );
};

const App: Component = () => {
  return (
    <div onClick={startFromFile} style="width: 100vw; height: 100vh;">
      <svg
        width="100%"
        height="100%"
        viewBox="-100 -100 200 200"
        preserveAspectRatio="xMidYMid meet"
      >
        <RadialGraph color={interpolateSinebow} scale={2.5} />
        <RadialGraph color={interpolateInferno} scale={1.5} />
      </svg>
    </div>
  );
};

export default App;
