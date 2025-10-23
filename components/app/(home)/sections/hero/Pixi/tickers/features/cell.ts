import { Ticker } from "@/components/shared/pixi/Pixi";

import AnimatedRect from "./components/AnimatedRect";
import BlinkingContainer from "./components/BlinkingContainer";
import crawl from "./crawl";
import mapping from "./mapping";
import scrape from "./scrape";
import search from "./search";

type Props = Parameters<Ticker>[0] & {
  x: number;
  y: number;
};

export const CELL_SIZE = 80;

// Theme-aware color for decorative elements
export const MAIN_COLOR = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  ? 0x1a1a1a  // Very dim in dark mode
  : 0xe6e6e6; // Light in light mode

const animations = [scrape, mapping, search, crawl];

let lastActive = -1;

export default function cell(props: Props) {
  const blinkingContainer = BlinkingContainer({
    x: props.x + 10,
    y: props.y + 10,
    app: props.app,
  });

  const anchorGraphic = AnimatedRect({
    app: props.app,
    x: CELL_SIZE / 2,
    y: CELL_SIZE / 2,
    width: 4,
    height: 4,
    radius: 10,
    color: MAIN_COLOR,
  });

  blinkingContainer.container.addChild(anchorGraphic.graphic);

  props.app.stage.addChild(blinkingContainer.container);

  let running = false;

  return {
    trigger: async () => {
      if (running) return;

      running = true;

      lastActive = (lastActive + 1) % animations.length;

      const fn = animations[lastActive];

      await fn({
        ...props,
        blinkingContainer,
        anchorGraphic,
      });

      running = false;
    },
  };
}
