import './style.css'

import React, { useRef, useState, useContext } from 'react'
import { ImageContext } from '@/ImageProvider';
import Button from '@/components/Button';
import Input from '@/components/Input';

import './style.css';

const ImageUploader = () => {
    const { setImage } = useContext(ImageContext);
    const [imageLink, setImageLink] = useState("");
    const inputFile = useRef(null);

    const handleButtonClick = () => inputFile.current.click();

    const handleImageChange = (event) => {
        event.preventDefault();
        const input = event.target;
        console.log(imageLink)
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64Image = e.target.result;
                setImage(base64Image);
            };
            reader.readAsDataURL(input.files[0]);
        } else {
            const imageUrl = imageLink;
            console.log(imageUrl);
            fetch(imageUrl, {
                method: 'POST',
                cache: 'no-cache',
            })
                .then(response => response.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        setImage(e.target.result);
                    };
                    reader.readAsDataURL(blob);
                })
                .catch(err => console.error(err))
        }
    };

    return (
        <section className="wrapper">
            <div className="content">
                <p className="title">Drag and drop the image for processing</p>
                <p className="subtitle">or just select the file</p>
                <input className="fileinput" ref={inputFile} type="file" accept="image/*" onChange={handleImageChange} />
                <div className="home__actions">
                    <div className="home__load-buttons">
                        <Button onClick={handleButtonClick} adjacent="left">Open Image</Button>
                    </div>
                </div>
            </div>
            <div className="url-wrapper">
                <div className="url-input">
                    <Input
                        type="text"

                        value={imageLink}
                        onChange={setImageLink}
                        placeholder="Enter image url"
                    />
                </div>
                <Button className="url-button" onClick={handleImageChange}>Download</Button>
            </div>
        </section>

    )
}

export default ImageUploader;