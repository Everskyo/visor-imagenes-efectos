import React, { useState, useRef } from "react";
import "./App.css";

function ZoomableImage({ src, filter }) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });

  const handleWheel = (e) => {
    e.preventDefault(); // Evita scroll de la página al hacer zoom
    const delta = e.deltaY;
    setScale((prev) => {
      let nextScale = prev - delta * 0.0015;
      if (nextScale < 1) nextScale = 1;
      if (nextScale > 3) nextScale = 3;
      if (nextScale === 1) {
        setPos({ x: 0, y: 0 });
        lastPos.current = { x: 0, y: 0 };
      }
      return nextScale;
    });
  };

  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    dragging.current = true;
    start.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!dragging.current) return;
    e.preventDefault();
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    setPos({
      x: lastPos.current.x + dx,
      y: lastPos.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    dragging.current = false;
    lastPos.current = { ...pos };
  };

  return (
    <div
      className="card"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ overflow: "hidden", cursor: scale > 1 ? "grab" : "default" }}
    >
      <img
        src={src}
        alt="zoomable"
        className={filter}
        style={{
          transform: `scale(${scale}) translate(${pos.x / scale}px, ${pos.y / scale}px)`,
          transition: dragging.current ? "none" : "transform 0.1s ease-out",
          userSelect: "none",
          pointerEvents: "all",
        }}
        draggable={false}
      />
    </div>
  );
}

function App() {
  const [images, setImages] = useState([]);
  const [filter, setFilter] = useState("");

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setImages(imageUrls);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Visor Profesional de Imágenes</h1>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleUpload}
          className="upload-input"
        />
      </header>

      <section className="filter-section">
        <span>Filtros:</span>
        <button
          className={filter === "" ? "active" : ""}
          onClick={() => setFilter("")}
        >
          Normal
        </button>
        <button
          className={filter === "grayscale" ? "active" : ""}
          onClick={() => setFilter("grayscale")}
        >
          Blanco y Negro
        </button>
        <button
          className={filter === "sepia" ? "active" : ""}
          onClick={() => setFilter("sepia")}
        >
          Sepia
        </button>
      </section>

      <main className="gallery">
        {images.length === 0 && (
          <p className="empty-msg">No has subido ninguna imagen.</p>
        )}
        {images.map((src, i) => (
          <ZoomableImage key={i} src={src} filter={filter} />
        ))}
      </main>

      <footer className="footer">
        <p>© 2025 Everardo Padron Castillo - Proyecto Visor de Imágenes</p>
      </footer>
    </div>
  );
}

export default App;
