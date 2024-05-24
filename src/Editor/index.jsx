import React, { useRef, useContext, useEffect, useState, useLayoutEffect } from "react";
import { ImageContext } from "@/ImageProvider";
import "./style.css";

import Arrow from "@/assets/arrow.svg?react"
import Pick from "@/assets/pick.svg?react";
import Download from "@/assets/download.svg?react"
import Move from "@/assets/move.svg?react"
import Transfrom from "@/assets/transform.svg?react"
import Fitltration from "@/assets/filtration.svg?react"
import Correction from "@/assets/correction.svg?react";

import Button from "@/components/Button";
import Modal from "@/components/Modal";
import ContextModal from "@/components/ContextModal";
import ScalingModal from "./ScalingModal";
import CurvesModal from "./CurvesModal";
import FilterModal from "./FilterModal";
import ImageUploader from "./ImageUploader";

import {
  updateTranslation,
  handleKeyDown,
  handleKeyUp,
  handleMouseUp,
  handleMouseDown,
} from "@/utils/CanvasChange/canvasKeyHand";
import {
  extractRGB,
  rgbToXyz,
  rgbToLab,
  calculateContrast,
} from "@/utils/RonvertColours/ronvertColours";

const Editor = () => {
  const { image, setImage } = useContext(ImageContext);

  const [toolActive, setToolActive] = useState("cursor");
  const [pipetteColor1, setPipetteColor1] = useState("");
  const [pipetteColor2, setPipetteColor2] = useState("");
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [fileSize, setFileSize] = useState(0);
  const [scaling, setScaling] = useState(0);
  const [scaleFactor, setScaleFactor] = useState(0);
  const [selectOption, setSelectOption] = useState(null);
  const [infoActive, setInfoActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [canvasTranslation, setCanvasTranslation] = useState({ x: 0, y: 0 });
  const [imageCoordinatesBase, setImageCoordinatesBase] = useState({
    x: 0,
    y: 0,
  });
  const [imageCoordinatesExtra, setImageCoordinatesExtra] = useState({
    x: 0,
    y: 0,
  });
  const [handStep] = useState(10);
  const [showBg, setShowBg] = useState(false);

  // Работа с модальны окном
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalCurvesOpen, setIsModalCurvesOpen] = useState(false);
  const [isModalFilterOpen, setIsModalFilterOpen] = useState(false);
  const openModal = () => {
    setIsModalOpen(true);
    setToolActive("cursor");
  };
  const openCurvesModal = () => {
    setIsModalCurvesOpen(true);
    setToolActive("cursor");
  };
  const openFilterModal = () => {
    setIsModalFilterOpen(true);
    setToolActive("cursor");
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setIsModalCurvesOpen(false);
    setIsModalFilterOpen(false);
  };
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const openContextModal = () => {
    setIsContextModalOpen(true);
    setToolActive("cursor");
    setInfoActive(true);
  };
  const closeContextModal = () => {
    setIsContextModalOpen(false);
    setToolActive("cursor");
    setInfoActive(false);
  };

  const onSelectScale = (ctx) => setScaleFactor((Math.min(Math.max(0.1, ctx / 100), 300)));

  const imageObj = new Image();
  imageObj.src = image;

  const canvas = useRef();
  const context = useRef();
  const animationFrameId = useRef(null);

  useEffect(() => {
    if (!image) return;

    const imageObj = new Image();

    imageObj.crossOrigin = "anonymous";

    imageObj.src = image;

    const workspace = document.querySelector(".workspace");
    const workspaceWidth = workspace.offsetWidth;
    const workspaceHeight = workspace.offsetHeight;
    const maxWidth = workspaceWidth - 100;
    const maxHeight = workspaceHeight - 100;

    imageObj.onload = () => {
      const widthScale = maxWidth / imageObj.width;
      const heightScale = maxHeight / imageObj.height;
      const newScaleFactor = Math.min(widthScale, heightScale);
      scaleFactor !== 0 || setScaleFactor(newScaleFactor);
      const scaledWidth = imageObj.width * scaleFactor;
      const scaledHeight = imageObj.height * scaleFactor;

      const canvasElement = canvas.current;
      context.current = canvasElement.getContext("2d");
      context.imageSmoothingEnabled = true;
      imageObj.willReadFrequently = true;

      canvasElement.width = workspaceWidth;
      canvasElement.height = workspaceHeight;
      context.current.clearRect(
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );
      context.current.drawImage(
        imageObj,
        canvasTranslation.x + (maxWidth - scaledWidth) / 2 + 50,
        canvasTranslation.y + (maxHeight - scaledHeight) / 2 + 50,
        scaledWidth,
        scaledHeight
      );
      setWidth(scaledWidth);
      setHeight(scaledHeight);

      setSelectOption(Math.round(newScaleFactor * 100));
      setFileSize(Math.floor((imageObj.src.length / 1024) * 0.77));

      const handleWheel = (event) => {
        event.preventDefault();
        const isCtrlPressed = event.ctrlKey || event.metaKey;
        const isTwoFingerScroll =
          event.deltaMode === 0 && Math.abs(event.deltaY) > 200;

        if (isCtrlPressed || isTwoFingerScroll) {
          const delta = event.deltaY;
          const newScaleFactor = scaleFactor + delta * 0.005; // Множитель для изменения скорости масштабирования
          setScaleFactor(Math.min(Math.max(0.1, newScaleFactor), 300));
        }
      };

      canvasElement.addEventListener("wheel", handleWheel);

      return () => {
        canvasElement.removeEventListener("wheel", handleWheel);
      };
    };
  }, [
    image,
    scaleFactor,
    canvasTranslation.x,
    canvasTranslation.y,
    isModalCurvesOpen,
    isModalFilterOpen,
  ]);

  const handleCanvasClick = (event) => {
    const canvasRef = canvas.current;
    const x = event.nativeEvent.offsetX;
    const y = event.nativeEvent.offsetY;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvasRef.width;
    tempCanvas.height = canvasRef.height;
    tempCanvas.willReadFrequently = true;
    const tempContext = tempCanvas.getContext("2d");
    tempContext.drawImage(canvasRef, 0, 0);

    const paddingW = document.querySelector(".workspace").offsetWidth - width;
    const paddingH = document.querySelector(".workspace").offsetHeight - height;

    const pixelData = tempContext.getImageData(x, y, 1, 1).data;
    const color = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
    toolActive === "pipette" && console.log("Выбранный цвет:", color);
    if (toolActive === "pipette") {
      if (event.altKey) {
        setPipetteColor2(color);
        setImageCoordinatesExtra({
          x: x - paddingW / 2 - canvasTranslation.x,
          y: y - paddingH / 2 - canvasTranslation.y,
        });
      } else {
        setPipetteColor1(color);
        setImageCoordinatesBase({
          x: x - paddingW / 2 - canvasTranslation.x,
          y: y - paddingH / 2 - canvasTranslation.y,
        });
      }
    }
  };

  const updateImage = (image) => {
    console.log(image);
    setImage(image);
  };

  // Рука

  useEffect(() => {
    const handleKeyDownEvent = (e) =>
      handleKeyDown(
        handStep,
        toolActive,
        canvasTranslation,
        setCanvasTranslation,
        e
      );
    document.body.addEventListener("keydown", handleKeyDownEvent);
    return () => {
      document.body.removeEventListener("keydown", handleKeyDownEvent);
    };
  }, [toolActive, canvasTranslation, setCanvasTranslation]);

  const handleMouseMove = (e) => {
    const rect = canvas.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Обновляем если курсор находится в пределах canvas
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      setCursor({ x, y });
    }

    // Перетаскивание изображения
    if (isDragging && toolActive === "hand") {
      const dx = e.clientX - rect.left - cursor.x;
      const dy = e.clientY - rect.top - cursor.y;
      updateTranslation(
        animationFrameId,
        canvasTranslation,
        setCanvasTranslation,
        dx,
        dy,
        width,
        height,
        scaleFactor
      );
    }
  };
  const handleKeyDownEvent = (e) =>
    handleKeyDown(
      handStep,
      toolActive,
      canvasTranslation,
      setCanvasTranslation,
      e
    );
  const handleKeyUpEvent = (e) =>
    handleKeyUp(toolActive, canvasTranslation, setCanvasTranslation, e);
  const handleMouseUpEvent = () => handleMouseUp(setIsDragging);
  const handleMouseDownEvent = () => handleMouseDown(toolActive, setIsDragging);

  useEffect(() => {
    const handleKeyDownShortcut = (event) => {
      switch (event.code) {
        case "KeyC":
          setToolActive("cursor");
          break;
        case "KeyP":
          setToolActive("pipette");
          setInfoActive(true);
          break;
        case "KeyH":
          setToolActive("hand");
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDownShortcut);

    return () => {
      window.removeEventListener("keydown", handleKeyDownShortcut);
    };
  }, []);


  async function handleDownload() {
    try {
      const handle = await showSaveFilePicker({
        suggestedName: 'editedImage.png',
        types: [{
          description: 'PNG Image',
          accept: { 'image/png': ['.png'] },
        }],
      });

      const canvasRef = canvas.current;
      const originalContext = canvasRef.getContext("2d");
      const copiedCanvas = deepCopyCanvas(originalContext.canvas);

      const url = copiedCanvas.toDataURL('image/png');
      const blob = await fetch(url).then(res => res.blob());

      const writableStream = await handle.createWritable();
      await writableStream.write(blob);
      await writableStream.close();
    } catch (error) {
      console.error('Error saving file:', error);
    }
  }

  function deepCopyCanvas(sourceCanvas) {
    const targetCanvas = document.createElement("canvas");
    targetCanvas.width = sourceCanvas.width;
    targetCanvas.height = sourceCanvas.height;
    const targetContext = targetCanvas.getContext("2d");
    targetContext.drawImage(sourceCanvas, 0, 0);
    return targetCanvas;
  }


  const showPreview = (value) => {
    setShowBg(value);
  };

  useLayoutEffect(() => {
    setScaling(Math.round(scaleFactor * 100));
  }, [scaleFactor]);


  return (
    <section className="editor">
      <div className="editor__menu-bar menu-bar">
      </div>
      <div className="editor__tool-panel tool-panel">
        <Button
          onClick={() => {
            setToolActive("cursor");
          }}
          active={toolActive === "cursor"}
          tooltip="A regular pointer tool for working with objects and resetting other tools."
          disabled={!image}
        >
          <Arrow />
        </Button>
        <Button
          onClick={() => {
            setToolActive("pipette");
          }}
          active={toolActive === "pipette"}
          tooltip="The pipette tool allows you to select the colors of the image"
          disabled={!image}
        >
          <Pick />
        </Button>
        <Button
          onClick={() => {
            setToolActive("hand");
          }}
          active={toolActive === "hand"}
          tooltip="A tool for moving the viewport of an image."
          disabled={!image}
        >
          <Move />
        </Button>
        <Button onClick={openModal} disabled={!image}>
          <Transfrom />
        </Button>
        <Button onClick={openCurvesModal} disabled={!image}>
          <Correction />
        </Button>
        <Button onClick={openFilterModal} disabled={!image}>
          <Fitltration />
        </Button>
        <Button onClick={handleDownload} disabled={!image}>
          <Download />
        </Button>

      </div>
      <div className="editor__info-panel info-panel">
        <Button
          onClick={() => {
            setInfoActive(!infoActive);
            !infoActive ? openContextModal() : closeContextModal();
          }}
          active={infoActive}
          disabled={!image}
        >
          <svg
            className="tool-panel__icon"
            role="img"
            fill="currentColor"
            viewBox="0 0 32 32"
            width="18"
            height="18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g data-name="Layer 2" id="Layer_2">
              <path d="M16,12a2,2,0,1,1,2-2A2,2,0,0,1,16,12Zm0-2Z" />
              <path d="M16,29A13,13,0,1,1,29,16,13,13,0,0,1,16,29ZM16,5A11,11,0,1,0,27,16,11,11,0,0,0,16,5Z" />
              <path d="M16,24a2,2,0,0,1-2-2V16a2,2,0,0,1,4,0v6A2,2,0,0,1,16,24Zm0-8v0Z" />
            </g>
          </svg>
        </Button>
      </div>

      <div className="editor__status-bar status-bar">
        <div>
          <span className="status-bar__text">
            Resolution: {Math.round(width)}&nbsp;x&nbsp;{Math.round(height)}
            &nbsp;px&nbsp;&nbsp;/&nbsp;&nbsp;
          </span>
          <span className="status-bar__text">
            File size: {fileSize}&nbsp;Кб &nbsp; / &nbsp;
          </span>
          <span className="status-bar__text">
            Coordinates: x&nbsp;{cursor.x}; y&nbsp;{cursor.y}
          </span>
        </div>

        <div className="menu-bar__size">
          {selectOption && (
            <>
              <p className="menu-bar__desc">Scailing: ({scaling}%)</p>
              <input
                type="range"
                min="12"
                max="300"
                step="2"
                value={scaling}
                onChange={(e) => onSelectScale(e.target.value)}
              />
            </>
          )}
        </div>

      </div>

      {
        image ? (
          <div
            className={
              "editor__workspace workspace" +
              (toolActive === "hand" ? " workspace--hand" : "")
            }
          >
            <canvas
              className={
                toolActive === "pipette"
                  ? "workspace__canvas workspace__canvas--pipette"
                  : "workspace__canvas"
              }
              ref={canvas}
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDownEvent}
              onMouseUp={handleMouseUpEvent}
              onKeyDown={!isModalOpen ? handleKeyDownEvent : null}
              onKeyUp={!isModalOpen ? handleKeyUpEvent : null}
              style={{
                cursor:
                  toolActive === "hand"
                    ? "grab"
                    : toolActive === "pipette"
                      ? "crosshair"
                      : "default",
              }}
            />
          </div>
        ) : (
          <div className="editor__workspace workspace workspace--empty">
            <ImageUploader />
          </div>
        )
      }

      <ContextModal
        isOpen={isContextModalOpen || toolActive === "pipette"}
        onClose={closeContextModal}
        title="Colors information"
      >
        <div className="editor__all-colors">
          <div className="editor__info-color">
            <p className="status-bar__text">&nbsp;</p>
            <div className="status-bar__color"></div>
            <p className="status-bar__text">
              <span
                className="tooltip"
                data-tooltip="RGB (red, green, blue) is an additive color model where each pixel is defined by a combination of red, green, and blue colors. The axes represent separate channels: red (R), green (G) and blue (B), each of which has a range of values from 0 to 255."
              >
                &#9432;
              </span>
              <span> RGB</span>
            </p>
            <p className="status-bar__text">
              <span
                className="tooltip"
                data-tooltip="XYZ is an absolute color model and is used to describe a color regardless of the device. The axes of this space represent three components: X, Y and Z, which characterize the color in terms of its brightness, as well as the red and green components. The range of values depends on the specific implementation, usually X and Y are in the range from 0 to 1, and Z is from 0 to 1."
              >
                &#9432;
              </span>
              <span> XYZ</span>
            </p>
            <p className="status-bar__text">
              <span
                className="tooltip"
                data-tooltip="Lab is a color model based on the perception of color by the human eye. The axes of this space include L (brightness), a (color from green to red) and b (color from blue to yellow). The L values range from 0 to 100, and the a and b values range from -128 to 127."
              >
                &#9432;
              </span>
              <span> Lab</span>
            </p>
            <p className="status-bar__text">xy</p>
          </div>
          <div className="editor__info-color">
            <p className="status-bar__text"><b>Color #1:&nbsp;</b></p>
            <div
              className="status-bar__color"
              style={{ backgroundColor: pipetteColor1 }}
            ></div>
            <p className="status-bar__text">&nbsp;{pipetteColor1}</p>
            <p className="status-bar__text">
              &nbsp;{pipetteColor1 && rgbToXyz(extractRGB(pipetteColor1))}
            </p>
            <p className="status-bar__text">
              &nbsp;{pipetteColor1 && rgbToLab(extractRGB(pipetteColor1))}
            </p>
            <p className="status-bar__text">
              &nbsp;({imageCoordinatesBase.x.toFixed(0)},{" "}
              {imageCoordinatesBase.y.toFixed(0)})
            </p>
          </div>
          <div className="editor__info-color">
            <p className="status-bar__text"><b>Color #2 (option):&nbsp;</b></p>
            <div
              className="status-bar__color"
              style={{ backgroundColor: pipetteColor2 }}
            ></div>
            <p className="status-bar__text">&nbsp;{pipetteColor2}</p>
            <p className="status-bar__text">
              &nbsp;{pipetteColor2 && rgbToXyz(extractRGB(pipetteColor2))}
            </p>
            <p className="status-bar__text">
              &nbsp;{pipetteColor2 && rgbToLab(extractRGB(pipetteColor2))}
            </p>
            <p className="status-bar__text">
              &nbsp;({imageCoordinatesExtra.x.toFixed(0)},{" "}
              {imageCoordinatesExtra.y.toFixed(0)})
            </p>
          </div>
          <p className="editor__contrast-info">
            Contrast {" "}
            {pipetteColor1 &&
              pipetteColor2 &&
              calculateContrast(
                extractRGB(pipetteColor1),
                extractRGB(pipetteColor2)
              )}
          </p>
        </div>
      </ContextModal>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Image scaling"
      >
        <ScalingModal
          image={imageObj}
          setImage={updateImage}
          closeModal={closeModal}
        />
      </Modal>
      <Modal
        w80
        bg0={showBg}
        isOpen={isModalCurvesOpen}
        onClose={closeModal}
        title="Image curves"
      >
        {isModalCurvesOpen && (
          <CurvesModal
            imageCtx={context}
            setImage={updateImage}
            closeModal={closeModal}
            showPreview={showPreview}
          />
        )}
      </Modal>
      <Modal
        bg0={showBg}
        isOpen={isModalFilterOpen}
        onClose={closeModal}
        title="Image filtration"
      >
        {isModalFilterOpen && (
          <FilterModal
            imageCtx={context}
            setImage={updateImage}
            closeModal={closeModal}
            showPreview={showPreview}
          />
        )}
      </Modal>
    </section >
  );
};

export default Editor;
