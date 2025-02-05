import { last } from "lodash";
import ecs from "../state/ecs";
import { clearCanvas, drawCell } from "../lib/canvas";
const { Animate, IsInFov } = require("../state/components");
import { gameState } from "../index";

const animatingEntities = ecs.createQuery({
  all: [Animate],
});

const hexToRgb = (hex) => {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : {};
};

export const AnimationSystem = () => {
  if (gameState !== "GAME") {
    return;
  }

  animatingEntities.get().forEach((entity) => {
    const animate = last(entity.animate);

    const { r = 255, g = 255, b = 255 } = hexToRgb(animate.color);

    const time = new Date();
    // set animation startTime
    if (!animate.startTime) {
      entity.fireEvent("set-start-time", { time });
    }
    const frameTime = time - animate.startTime;
    // end animation when complete
    if (frameTime > animate.duration) {
      return entity.remove("Animate");
    }
    const framePercent = frameTime / animate.duration;
    // do the animation
    // clear the cell first
    clearCanvas(entity.position.x, entity.position.y, 1, 1);

    // redraw the existing entity
    drawCell(entity);

    // draw the animation over top
    drawCell({
      appearance: {
        char: animate.char || entity.appearance.char,
        color: `rgba(${r}, ${g}, ${b}, ${1 - framePercent})`,
        background: "transparent",
      },
      position: entity.position,
    });
  });
};
