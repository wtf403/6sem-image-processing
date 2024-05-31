import React, { useEffect, useContext, useRef, useState } from "react";
import "./style.css";
import Button from "@/components/Button";
import { ImageContext } from "@/ImageProvider";
import Input from "@/components/Input";
import addPadding from "@/utils/ImageProcessing/addPadding";

const FilterModal = ({ imageCtx, closeModal, showPreview }) => {
  const { image, setImage } = useContext(ImageContext);
  const [arrData, setArrData] = useState([]);
  const [mode, setMode] = useState("identical");

  const [matrix, setMatrix] = useState([
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
  ]);
  const modes = [
    {
      value: "identical",
      name: "Identity mapping",
      matrix: [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ],
    },
    {
      value: "sharpening",
      name: "Sharpening",
      matrix: [
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0],
      ],
    },
    {
      value: "gauss",
      name: "Gaussian filter",
      matrix: [
        [1, 2, 1],
        [2, 4, 2],
        [1, 2, 1],
      ],
    },
    {
      value: "rectangular",
      name: "Rectangular blur",
      matrix: [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
      ],
    },
    {
      value: "x-sobel",
      name: "Sobel X",
      matrix: [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1],
      ],
    },
    {
      value: "y-sobel",
      name: "Sobel Y",
      matrix: [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1],
      ],
    },
  ];

  const [previewActive, setPreviewActive] = useState(false);
  const preview = useRef(null);

  useEffect(() => {
    if (!imageCtx) return;
    const canvasRef = preview.current;
    const ctx = canvasRef.getContext("2d");
    const imageObj = new Image();
    imageObj.src = image;
    imageObj.crossOrigin = "anonymous";
    imageObj.onload = () => {
      canvasRef.width = imageObj.width;
      canvasRef.height = imageObj.height;
      ctx.drawImage(imageObj, 0, 0);
      const data = ctx.getImageData(0, 0, imageObj.width, imageObj.height).data;
      setArrData(data);
    };
    if (previewActive) {
      const workspace = document.querySelector(".workspace");
      const workspaceWidth = workspace.offsetWidth;
      const workspaceHeight = workspace.offsetHeight;
      const maxWidth = workspaceWidth - 100;
      const maxHeight = workspaceHeight - 100;
      const widthScale = maxWidth / imageObj.width;
      const heightScale = maxHeight / imageObj.height;
      const newScaleFactor = Math.min(widthScale, heightScale);
      const scaledWidth = imageObj.width * newScaleFactor;
      const scaledHeight = imageObj.height * newScaleFactor;

      const imageObjPreview = new Image();
      imageObjPreview.src = image;
      const ctx = imageCtx.current;
      const img = new Image();
      img.src = filteringImage();

      img.onload = () => {
        ctx.clearRect(0, 0, ctx.width, ctx.height);
        ctx.drawImage(
          img,
          (maxWidth - scaledWidth) / 2 + 50,
          (maxHeight - scaledHeight) / 2 + 50,
          scaledWidth,
          scaledHeight
        );
      };
    }
  }, [imageCtx, matrix]);

  const handlePreview = (value) => {
    setPreviewActive(value);
    showPreview(value);
  };

  const handleSubmit = () => {
    const result = filteringImage();
    setImage(result);
    closeModal();
  };

  const handleMatrixChange = (i, j, value) => {
    const newMatrix = [...matrix];
    newMatrix[i][j] = value;
    setMatrix(newMatrix);
    setMode("self");
    if (previewActive) {
      handlePreview(previewActive);
    }
  };

  const filteringImage = () => {
    const imageObj = new Image();
    imageObj.src = image;
    const paddData = addPadding(arrData, imageObj.width, imageObj.height);
    const result = new Uint8ClampedArray(arrData.length);
    if (mode === "x-sobel" || mode === "y-sobel") {
      const width = imageObj.width;
      const height = imageObj.height;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          for (let c = 0; c < 3; c++) {  // Only process RGB, ignore alpha
            const outputIndex = (y * width + x) * 4 + c;
            let sum = 0;
            for (let ky = 0; ky < 3; ky++) {
              for (let kx = 0; kx < 3; kx++) {
                const inputIndex = ((y + ky) * (width + 2) + (x + kx)) * 4 + c;
                sum += paddData[inputIndex] * matrix[ky][kx];
              }
            }
            result[outputIndex] = Math.min(Math.max(sum, 0), 255);
          }
          result[(y * width + x) * 4 + 3] = arrData[(y * width + x) * 4 + 3]; // Preserve alpha
        }
      }
    } else {
      for (let y = 0; y < imageObj.height; y++) {
        for (let x = 0; x < imageObj.width; x++) {
          for (let z = 0; z < 4; z++) {
            const out = (y * imageObj.width + x) * 4 + z;
            let sum = 0;
            let sumMatrix = 0;
            for (let i = 0; i < 3; i++) {
              for (let j = 0; j < 3; j++) {
                const inp = ((y + i) * (imageObj.width + 2) + (x + j)) * 4 + z;
                sum += paddData[inp] * matrix[i][j];
                sumMatrix += matrix[i][j];
              }
            }
            result[out] = sum / sumMatrix;
          }
        }
      }
    }
    setArrData(result);

    const canvas = document.createElement("canvas");
    canvas.width = imageObj.width;
    canvas.height = imageObj.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageObj, 0, 0);
    ctx.putImageData(
      new ImageData(result, imageObj.width, imageObj.height),
      0,
      0
    );
    const newImage = canvas.toDataURL("image/jpeg");
    return newImage;
  };

  return (
    <form
      className="filter-modal form"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <div className="filter-modal__inputs">
        {Array.from({ length: 3 }, (_, i) =>
          Array.from({ length: 3 }, (_, j) => (
            <div className="filter-modal__input" key={`${i}-${j}`}>
              <Input
                w100
                type="number"
                value={
                  mode !== "self"
                    ? modes.find((item) => item.value === mode)?.matrix[i][j]
                    : matrix[i][j]
                }
                onChange={(event) => {
                  handleMatrixChange(i, j, parseInt(event.target.value));
                }}
              />
            </div>
          ))
        )}
      </div>
      <fieldset className="filter-modal__table">
        {modes.map((modeItem, index) => (
          <label
            key={index}
            htmlFor={modeItem.value}
            className="filter-modal__mode"
          >
            <input
              id={modeItem.value}
              name="mode"
              type="radio"
              checked={mode === modeItem.value}
              onChange={() => {
                setMode(modeItem.value);
                setMatrix(modeItem.matrix);
                handlePreview(previewActive);
              }}
            />
            {modeItem.name}
          </label>
        ))}
      </fieldset>
      <div className="filter-modal__settings">
        <label htmlFor="previewCheckbox">
          <span>Preview</span>
          <Input
            type="checkbox"
            name="previewCheckbox"
            id="previewCheckbox"
            onChange={(e) => handlePreview(e.target.checked)}
          />
        </label>
      </div>
      <canvas
        ref={preview}
        className={
          previewActive
            ? "filter-modal__preview--active"
            : "filter-modal__preview"
        }
      ></canvas>
      <div className="filter-modal__actions">
        <Button
          className="filter-modal__button"
          normal
          shadow
          onClick={() => {
            setMode("identical");
            setMatrix([
              [0, 0, 0],
              [0, 1, 0],
              [0, 0, 0],
            ]);
          }}
        >
          Сбросить
        </Button>
        <Button
          className="filter-modal__button"
          accent={true}
          onClick={() => handleSubmit()}
        >
          Применить
        </Button>
      </div>
    </form>
  );
};

export default FilterModal;
