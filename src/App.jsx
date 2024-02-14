import React from 'react';
import './style.css';
import Editor from './Editor';
import { ImageProvider } from './ImageProvider';

function App() {

  return (
    <ImageProvider>
      <Editor />
    </ImageProvider>
  )
}

export default App
