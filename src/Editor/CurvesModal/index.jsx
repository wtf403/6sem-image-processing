import React, { useEffect, useContext, useRef, useState } from "react";
import "./style.css";
import { ImageContext } from "@/ImageProvider";
import * as d3 from "d3";
import Input from "@/components/Input";
import Button from "@/components/Button";
import calculateCurves from "@/utils/ImageProcessing/calculateCurves";

const CurvesModal = ({ imageCtx, closeModal, showPreview }) => {
  const { image, setImage } = useContext(ImageContext);
  const [arrData, setArrData] = useState([]);
  const [inA, setInA] = useState(25);
  const [outA, setOutA] = useState(25);
  const [inB, setInB] = useState(230);
  const [outB, setOutB] = useState(230);
  const [prevInA, setPrevInA] = useState(25);
  const [prevOutA, setPrevOutA] = useState(25);
  const [prevInB, setPrevInB] = useState(230);
  const [prevOutB, setPrevOutB] = useState(230);
  const [arrR, setArrR] = useState([]);
  const [arrG, setArrG] = useState([]);
  const [arrB, setArrB] = useState([]);
  const [previewActive, setPreviewActive] = useState(false);
  const preview = useRef(null);

  useEffect(() => {
    if (!imageCtx) return;
    const canvasRef = preview.current;
    const ctx = canvasRef.getContext("2d");
    const imageObj = new Image();
    imageObj.src = image;
    imageObj.crossOrigin = "anonymous";
    canvasRef.width = imageObj.width;
    canvasRef.height = imageObj.height;
    ctx.drawImage(imageObj, 0, 0);
    const data = ctx.getImageData(0, 0, imageObj.width, imageObj.height).data;
    setArrData(data);
    const tempArrR = new Array(256).fill(0);
    const tempArrG = new Array(256).fill(0);
    const tempArrB = new Array(256).fill(0);

    for (let i = 0; i < data.length; i += 4) {
      tempArrR[data[i]]++;
      tempArrG[data[i + 1]]++;
      tempArrB[data[i + 2]]++;
    }

    setArrR(tempArrR);
    setArrG(tempArrG);
    setArrB(tempArrB);
  }, [imageCtx]);

  useEffect(() => {
    if (arrR.length === 0 || arrG.length === 0 || arrB.length === 0) return;

    const combinedArray = [...arrR, ...arrG, ...arrB];
    const maxV = Math.max(...combinedArray);
    const tempArrR = arrR.map((val) => (val / maxV) * 255);
    const tempArrG = arrG.map((val) => (val / maxV) * 255);
    const tempArrB = arrB.map((val) => (val / maxV) * 255);

    buildHistogram(tempArrR, tempArrG, tempArrB);
    handlePreview(previewActive);
  }, [inA, outA, inB, outB, imageCtx, arrR, arrG, arrB]);

  const buildHistogram = (dataR, dataG, dataB) => {
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const width = 500 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    d3.select("#histogram").selectAll("*").remove();

    const svg = d3
      .select("#histogram")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3.scaleLinear().domain([0, 255]).range([0, width]);

    const y = d3.scaleLinear().domain([0, 255]).range([height, 0]);

    const color = d3
      .scaleOrdinal()
      .domain(["dataR", "dataG", "dataB"])
      .range(["red", "green", "blue"]);

    svg
      .append("path")
      .datum(dataR)
      .attr("class", "line")
      .style("stroke", color("dataR"))
      .style("fill", "none")
      .attr(
        "d",
        d3
          .line()
          .x((d, i) => x(i))
          .y((d) => y(d))
          .curve(d3.curveBasis)
      );

    svg
      .append("path")
      .datum(dataG)
      .attr("class", "line")
      .style("stroke", color("dataG"))
      .style("fill", "none")
      .attr(
        "d",
        d3
          .line()
          .x((d, i) => x(i))
          .y((d) => y(d))
          .curve(d3.curveBasis)
      );

    svg
      .append("path")
      .datum(dataB)
      .attr("class", "line")
      .style("stroke", color("dataB"))
      .style("fill", "none")
      .attr(
        "d",
        d3
          .line()
          .x((d, i) => x(i))
          .y((d) => y(d))
          .curve(d3.curveBasis)
      );

    svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickValues(d3.range(0, 256, 15)));

    svg
      .append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(y).tickValues(d3.range(0, 256, 15)));

    svg
      .selectAll(".pointA")
      .data([{ x: inA, y: outA }])
      .join("circle")
      .attr("class", "pointA")
      .attr("cx", (d) => x(d.x))
      .attr("cy", (d) => y(d.y))
      .attr("r", 5)
      .style("fill", "currentColor")
      .style("cursor", "move")
      .call(
        d3
          .drag()
          .on("start", function () {
            d3.select(this).raise().attr("stroke", "red");
          })
          .on("drag", function (event) {
            const svgElement = document.getElementById("histogram");
            const svgRect = svgElement.getBoundingClientRect();
            const svgX = event.x - svgRect.left;
            const svgY = event.y - svgRect.top;
            const newX = Math.max(5, Math.min(inB - 1, x.invert(svgX)));
            const newY = Math.max(5, Math.min(255, svgY > 255 / 2 ? 255 / 2 + (svgY - 255 / 2) / 2 : svgY));
            setInA(Math.round(newX));
            setOutA(Math.round(newY));
          })
          .on("end", function () {
            d3.select(this).attr("stroke", null);
          })
      );

    svg
      .selectAll(".pointB")
      .data([{ x: inB, y: outB }])
      .join("circle")
      .attr("class", "pointB")
      .attr("cx", (d) => x(d.x))
      .attr("cy", (d) => y(d.y))
      .attr("r", 5)
      .style("fill", "currentColor")
      .style("cursor", "move")
      .call(
        d3
          .drag()
          .on("start", function () {
            d3.select(this).raise().attr("stroke", "red");
          })
          .on("drag", function (event) {
            const svgElement = document.getElementById("histogram");
            const svgRect = svgElement.getBoundingClientRect();
            const svgX = event.x - svgRect.left;
            const svgY = event.y - svgRect.top;
            const newX = Math.max(inA + 1, Math.min(255, x.invert(svgX)));
            const newY = Math.max(1, Math.min(255, svgY > 255 / 2 ? 255 / 2 + (svgY - 255 / 2) / 2 : svgY));
            d3.select(this).attr("cx", x(newX)).attr("cy", y(newY));
            setInB(Math.round(newX));
            setOutB(Math.round(newY));
          })
          .on("end", function () {
            d3.select(this).attr("stroke", null);
          })
      );

    svg
      .append("line")
      .attr("class", "line")
      .attr("x1", x(inA))
      .attr("y1", y(outA))
      .attr("x2", x(inB))
      .attr("y2", y(outB))
      .style("stroke", "currentColor")
      .style("stroke-width", 1.2);

    svg
      .append("line")
      .attr("class", "line")
      .attr("x1", x(0))
      .attr("y1", y(outA))
      .attr("x2", x(inA))
      .attr("y2", y(outA))
      .style("stroke", "currentColor")
      .style("stroke-width", 1.2);

    svg
      .append("line")
      .attr("class", "line")
      .attr("x1", x(255))
      .attr("y1", y(outB))
      .attr("x2", x(inB))
      .attr("y2", y(outB))
      .style("stroke", "currentColor")
      .style("stroke-width", 1.2);

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Output")
      .style("fill", "currentColor");

    svg
      .append("text")
      .attr(
        "transform",
        "translate(" + width / 2 + " ," + (height + margin.top + 20) + ")"
      )
      .style("text-anchor", "middle")
      .text("Input")
      .style("fill", "currentColor");

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 0 - margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .text("RGB histogram")
      .style("fill", "currentColor");
  };

  const handleCurvesConfirm = () => {
    const newData = calculateCurves(arrData, inA, outA, inB, outB);
    const img = new Image();
    img.src = image;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = newData[i];
        data[i + 1] = newData[i + 1];
        data[i + 2] = newData[i + 2];
      }

      ctx.putImageData(imageData, 0, 0);
      const newImage = canvas.toDataURL("image/jpeg");
      setImage(newImage);
      closeModal();
    };
  };

  const handleCurvesPreview = () => {
    const newData = calculateCurves(arrData, inA, outA, inB, outB);
    const img = new Image();
    img.src = image;
    img.onload = () => {
      const canvas = imageCtx;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.current;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = newData[i];
        data[i + 1] = newData[i + 1];
        data[i + 2] = newData[i + 2];
      }

      ctx.putImageData(imageData, 0, 0);
      const newImage = canvas.toDataURL("image/png");
      ctx.drawImage(newImage, 0, 0);
    };
  };

  const handleCurvesReset = () => {
    setInA(1);
    setOutA(1);
    setInB(255);
    setOutB(255);
  };

  const handlePreview = (value) => {
    setPreviewActive(value);
    showPreview(value);
    if (value) {
      const newData = calculateCurves(arrData, inA, outA, inB, outB);
      const img = new Image();
      img.src = image;
      const ctx = preview.current.getContext("2d");
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = newData[i];
          data[i + 1] = newData[i + 1];
          data[i + 2] = newData[i + 2];
        }
        ctx.putImageData(imageData, 0, 0);
      };

      if (value) {
        handleCurvesPreview();
      } else {
        const canvas = imageCtx;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.current;
        ctx.drawImage(img, 0, 0);
      }
    }
  };

  const validateInput = (newValue, type) => {
    if (type === "inA" && (newValue < 0 || newValue >= inB)) {
      return false;
    }
    if (type === "inB" && (newValue <= inA || newValue > 255)) {
      return false;
    }
    if ((type === "outA" || type === "outB") && (newValue < 0 || newValue > 255)) {
      return false;
    }
    return true;
  };

  return (
    <form
      className="curves-modal form"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <svg id="histogram" width="600" height="400"></svg>
      <div className="curves-modal__edit">
        <div className="curves-modal__table">
          <h3 className="curves-modal__name curves-modal__name--a">A</h3>
          <h3 className="curves-modal__name curves-modal__name--b">B</h3>
          <p className="curves-modal__type">Input</p>
          <Input
            type="number"
            max={Number(inB) - 1}
            min={0}
            value={inA}
            onChange={(v) => {
              if (validateInput(v, "inA")) {
                setPrevInA(inA);
                setInA(v);
              } else {
                setInA(prevInA);
              }
            }}
          />
          <Input
            type="number"
            max={255}
            min={Number(inA) + 1}
            value={inB}
            onChange={(v) => {
              if (validateInput(v, "inB")) {
                setPrevInB(inB);
                setInB(v);
              } else {
                setInB(prevInB);
              }
            }}
          />
          <p className="curves-modal__type">Output</p>
          <Input
            type="number"
            max={255}
            min={0}
            value={outA}
            onChange={(v) => {
              if (validateInput(v, "outA")) {
                setPrevOutA(outA);
                setOutA(v);
              } else {
                setOutA(prevOutA);
              }
            }}
          />
          <Input
            type="number"
            max={255}
            min={0}
            value={outB}
            onChange={(v) => {
              if (validateInput(v, "outB")) {
                setPrevOutB(outB);
                setOutB(v);
              } else {
                setOutB(prevOutB);
              }
            }}
          />
        </div>
        <div className="curves-modal__settings">
          <label className="preview">
            <Input
              type="checkbox"
              name="previewCheckbox"
              id="previewCheckbox"
              onChange={handlePreview}
            />
            <span>Preview</span>
          </label>
        </div>
      </div>
      <canvas
        ref={preview}
        className={
          previewActive
            ? "curves-modal__preview--active"
            : "curves-modal__preview"
        }
      ></canvas>
      <div className="curves-modal__actions">
        <Button
          className="curves-modal__button"
          normal
          shadow
          onClick={handleCurvesReset}
        >
          Сбросить
        </Button>
        <Button
          className="curves-modal__button"
          accent={true}
          onClick={handleCurvesConfirm}
        >
          Применить
        </Button>
      </div>
    </form>
  );
};

export default CurvesModal;