export const updateTranslation = (
  animationFrameId,
  canvasTranslation,
  setCanvasTranslation,
  dx,
  dy,
  width,
  height
) => {
  if (animationFrameId.current) {
    cancelAnimationFrame(animationFrameId.current);
  }

  let newX = canvasTranslation.x + dx;
  let newY = canvasTranslation.y + dy;
  if (width * -1 > newX) {
    newX = width * -1 + 2;
  }
  if (newX > width) {
    newX = width - 2;
  }
  if (height * -1 > newY) {
    newY = height * -1 + 2;
  }
  if (newY > height) {
    newY = height - 2;
  }
  animationFrameId.current = requestAnimationFrame(() => {
    setCanvasTranslation({
      x: newX,
      y: newY,
    });
  });
};

export const handleMouseDown = (toolActive, setIsDragging) => {
  if (toolActive === "hand") {
    setIsDragging(true);
  }
};

export const handleMouseUp = (setIsDragging) => {
  setIsDragging(false);
};

export const handleKeyDown = (
  step,
  toolActive,
  canvasTranslation,
  setCanvasTranslation,
  e
) => {
  if (toolActive === "hand") {
    switch (e.key) {
      case "ArrowLeft":
        setCanvasTranslation({
          x: canvasTranslation.x - step,
          y: canvasTranslation.y,
        });
        break;
      case "ArrowRight":
        setCanvasTranslation({
          x: canvasTranslation.x + step,
          y: canvasTranslation.y,
        });
        break;
      case "ArrowUp":
        setCanvasTranslation({
          x: canvasTranslation.x,
          y: canvasTranslation.y - step,
        });
        break;
      case "ArrowDown":
        setCanvasTranslation({
          x: canvasTranslation.x,
          y: canvasTranslation.y + step,
        });
        break;
      default:
        break;
    }
  }
};

export const handleKeyUp = (
  toolActive,
  canvasTranslation,
  setCanvasTranslation,
  e
) => {
  if (toolActive === "hand") {
    switch (e.key) {
      case "ArrowLeft":
      case "ArrowRight":
      case "ArrowUp":
      case "ArrowDown":
        // Остановить перемещение при отпускании клавиши
        setCanvasTranslation({
          x: canvasTranslation.x,
          y: canvasTranslation.y,
        });
        break;
      default:
        break;
    }
  }
};
