import React, { useState, useEffect, useContext } from 'react';
import './style.css';
import Dropdown from '@/components/Dropdown';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { ImageContext } from '@/ImageProvider';
import nearestNeighborInterpolation from '@/utils/ImageProcessing/NearestNeighborInterpolation';

const ScalingModal = ({ image, closeModal }) => {
    const { setImage } = useContext(ImageContext);
    const [resizeMode, setResizeMode] = useState('Pixels');
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [lockAspectRatio, setLockAspectRatio] = useState(true);
    const [aspectRatio, setAspectRatio] = useState(0);
    const [interpolationAlgorithm, setInterpolationAlgorithm] = useState('Nearest Neighbor Interpolation');
    const [initialPixels, setInitialPixels] = useState(0);
    const [resizedPixels, setResizedPixels] = useState(0);
    // Для ошибок ввода
    const [widthError, setWidthError] = useState('');
    const [heightError, setHeightError] = useState('');

    useEffect(() => {
        if (!image) return;
        setInitialPixels((image.width * image.height / 1000000).toFixed(2));
        setHeight(image.height);
        setWidth(image.width);
        setResizedPixels((width * height / 1000000).toFixed(2));
        setAspectRatio(image.width / image.height);
    }, [image])

    useEffect(() => {
        if (resizeMode == "Percentage") {
            setWidth(100);
            setHeight(100);
        } else {
            setWidth(image.width);
            setHeight(image.height);
        }
    }, [resizeMode])

    useEffect(() => {
        if (!Number.isInteger(Number(height)) || Number(height) <= 0) {
            setHeightError('⚠ Height should be a positive integer');
        } else {
            setHeightError('');
        }
        if (!Number.isInteger(Number(width)) || Number(width) <= 0) {
            setWidthError('⚠ Width should be a positive integer');
        } else {
            setWidthError('');
        }
    }, [height, width])

    const handleWidthChange = (value) => {
        setWidth(value);
        if (lockAspectRatio) {
            const newHeight = resizeMode === 'Percentage' ? value : (value / aspectRatio);
            setHeight(Math.round(newHeight));
            setResizedPixels(((resizeMode === 'Percentage' ? image.height * image.width * (value / 100) ** 2 : newHeight * value) / 1000000).toFixed(2));
        } else {
            setResizedPixels(((resizeMode === 'Percentage' ? image.height * image.width * value / 100 * height / 100 : height * value) / 1000000).toFixed(2));
        }
    };

    const handleHeightChange = (value) => {
        setHeight(value);
        if (lockAspectRatio) {
            const newWidth = resizeMode === 'Percentage' ? value : (value * aspectRatio);
            setWidth(Math.round(newWidth));
            setResizedPixels(((resizeMode === 'Percentage' ? image.height * image.width * (value / 100) ** 2 : newWidth * value) / 1000000).toFixed(2));
        } else {
            setResizedPixels(((resizeMode === 'Percentage' ? image.height * image.width * value / 100 * width / 100 : width * value) / 1000000).toFixed(2));
        }
    };

    const handleResizeConfirm = () => {
        if (heightError || widthError || resizeMode == "Percentage" ? (height * image.height / 100 > 10000 || image.width * width / 100 > 10000) : (height > 10000 || width > 10000)) return
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const newWidth = resizeMode === 'Percentage' ? Math.round((image.width * width) / 100) : width;
        const newHeight = resizeMode === 'Percentage' ? Math.round((image.height * height) / 100) : height;
        console.log(newWidth, newHeight)
        canvas.width = newWidth;
        canvas.height = newHeight;
        // Рисование исходного изображения на холсте
        ctx.drawImage(image, 0, 0, newWidth, newHeight);
        // Получение пиксельных данных исходного изображения
        const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
        // Применение алгоритма ближайшего соседа для интерполяции
        if (interpolationAlgorithm === 'Ближайший сосед') {
            const resizedImageData = nearestNeighborInterpolation(imageData, newWidth, newHeight);
            ctx.putImageData(resizedImageData, 0, 0);
        }
        // Обновление изображения на холсте
        setImage(canvas.toDataURL('image/png'));
        setResizeMode("Pixels")
        closeModal();
    };

    const handleResizeModeChange = (selectedOption) => {
        setResizeMode(selectedOption);
    };

    const handleInterpolationAlgorithmChange = (selectedOption) => {
        setInterpolationAlgorithm(selectedOption);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
    }

    return (
        <form className="scaling-modal" onSubmit={handleSubmit}>
            <p className="form__text">
                Original image size: {initialPixels} MPx
            </p>
            <p className="form__text">
                Image size after change: {resizedPixels} MPx
            </p>
            <h3 className="form__name">Setup sizes</h3>
            <div className="form__settings">
                <label className="form__label" htmlFor="resize-mode">Units</label>
                <Dropdown id="resize-mode" options={["Percentage", "Pixels"]} onSelect={handleResizeModeChange} selectOption={"Pixels"} />
                <label className="form__label" htmlFor="width">Width</label>
                <Input
                    type="number"
                    id="width"
                    value={width}
                    onChange={handleWidthChange}
                    min={1}
                    max={resizeMode === 'Pixels' ? 1000 : 10000}
                    step={1}
                />
                <label className="form__label" htmlFor="height">Height</label>
                <Input
                    type="number"
                    id="height"
                    value={height}
                    onChange={handleHeightChange}
                    min={1}
                    max={resizeMode === 'Percentage' ? 1000 : 10000}
                    step={1}
                />
                <div className="form__lock">
                    <svg className="form__lock-line" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 4.5">
                        <line className="lock" y1="0.5" x2="16.5" y2="0.5"></line>
                        <line className="lock" x1="16.5" x2="16.5" y2="4.5"></line>
                    </svg>
                    <button className="form__lock-button" onClick={() => setLockAspectRatio(!lockAspectRatio)}>
                        {lockAspectRatio
                            ? <svg role="img" fill="currentColor" viewBox="0 0 18 18" id="SLockClosed18N-icon" width="18" height="18" aria-hidden="true" aria-label="" focusable="false"><path fillRule="evenodd" d="M14.5,8H14V7A5,5,0,0,0,4,7V8H3.5a.5.5,0,0,0-.5.5v8a.5.5,0,0,0,.5.5h11a.5.5,0,0,0,.5-.5v-8A.5.5,0,0,0,14.5,8ZM6,7a3,3,0,0,1,6,0V8H6Zm4,6.111V14.5a.5.5,0,0,1-.5.5h-1a.5.5,0,0,1-.5-.5V13.111a1.5,1.5,0,1,1,2,0Z"></path></svg>
                            : <svg role="img" fill="currentColor" viewBox="0 0 18 18" id="SLockOpen18N-icon" width="18" height="18" aria-hidden="true" aria-label="" focusable="false"><path fillRule="evenodd" d="M14.5,8H5.95V5.176A3.106,3.106,0,0,1,9,2a3.071,3.071,0,0,1,2.754,1.709c.155.32.133.573.389.573a.237.237,0,0,0,.093-.018l1.34-.534a.256.256,0,0,0,.161-.236C13.737,2.756,12.083.1,9,.1A5.129,5.129,0,0,0,4,5.146V8H3.5a.5.5,0,0,0-.5.5v8a.5.5,0,0,0,.5.5h11a.5.5,0,0,0,.5-.5v-8A.5.5,0,0,0,14.5,8ZM10,13.111V14.5a.5.5,0,0,1-.5.5h-1a.5.5,0,0,1-.5-.5V13.111a1.5,1.5,0,1,1,2,0Z"></path></svg>
                        }
                    </button>
                    <svg className="form__lock-line" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 7">
                        <line className="lock" y1="4.5" x2="17" y2="4.5"></line>
                        <line className="lock" x1="16.5" x2="16.5" y2="4.5"></line>
                    </svg>
                </div>
                <label className="form__label" htmlFor="interpolation-algorithm">Interpolation algorithm</label>
                <div className="form__select-iterpolation">
                    <span
                        className="tooltip"
                        data-tooltip="The nearest neighbor algorithm takes the color value of the nearest pixel of the original image for each pixel in the new image. This is a simple and fast algorithm, but it can lead to pixelation when the size changes significantly."
                    >
                        &#9432;
                    </span>
                    <Dropdown id="interpolation-algorithm" options={["Nearest Neighbor Interpolation"]} onSelect={handleInterpolationAlgorithmChange} selectOption={"Nearest Neighbor Interpolation"} />
                </div>
            </div>
            <div className="form__errors">
                {widthError && <p className="form__error">{widthError}</p>}
                {heightError && <p className="form__error">{heightError}</p>}
                {resizeMode == "Percentage" ?
                    (height * image.height / 100 > 10000 || image.width * width / 100 > 10000) && <p className="form__error"> ⚠ The width or height of the image should not exceed 10000px (с учетом проценто H {height * image.height / 100}px W {image.width * width / 100}px)</p>
                    :
                    (height > 10000 || width > 10000) && <p className="form__error"> ⚠ The width or height of the image should not exceed 10000px</p>
                }
            </div>
            <Button className="form__button" accent={true} onClick={handleResizeConfirm}>
                Apply scaling
            </Button>
        </form>
    );
};

export default ScalingModal;
