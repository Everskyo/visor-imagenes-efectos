import React, { useState, useRef } from "react";
import "./App.css";

function ZoomableImage({ src, filter }) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const handleWheel = (e) => {
    e.preventDefault();
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

  const downloadImage = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const ctx = canvas.getContext("2d");

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Filtros canvas
    switch (filter) {
      case "grayscale":
        ctx.filter = "grayscale(100%)";
        break;
      case "sepia":
        ctx.filter = "sepia(100%)";
        break;
      default:
        ctx.filter = "none";
    }

    ctx.save();
    // Ajustamos escala y posición para reflejar zoom y desplazamiento
    ctx.scale(scale, scale);
    ctx.translate(pos.x / scale, pos.y / scale);

    ctx.drawImage(img, 0, 0);
    ctx.restore();

    const link = document.createElement("a");
    link.download = "imagen-editada.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div
      className="card"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: scale > 1 ? "grab" : "default" }}
    >
      <img
        ref={imgRef}
        src={src}
        alt="zoomable"
        className={filter}
        style={{
          transform: `scale(${scale}) translate(${pos.x / scale}px, ${pos.y / scale}px)`,
          transition: dragging.current ? "none" : "transform 0.15s ease-out",
          userSelect: "none",
          pointerEvents: "all",
          display: "block",
          width: "100%",
          height: "auto",
          borderRadius: "12px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
        }}
        draggable={false}
      />
      <button
        onClick={downloadImage}
        className="btn-download"
        aria-label="Descargar imagen"
      >
        Descargar
      </button>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

function App() {
  const [images, setImages] = useState([]);
  const [filter, setFilter] = useState("");

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map((file) => URL.createObjectURL(file));
    setImages(urls);
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
          aria-label="Subir imágenes"
        />
      </header>

      <section className="filter-section" aria-label="Filtros de imagen">
        <span>Filtros:</span>
        <button
          className={filter === "" ? "active" : ""}
          onClick={() => setFilter("")}
          aria-pressed={filter === ""}
        >
          Normal
        </button>
        <button
          className={filter === "grayscale" ? "active" : ""}
          onClick={() => setFilter("grayscale")}
          aria-pressed={filter === "grayscale"}
        >
          Blanco y Negro
        </button>
        <button
          className={filter === "sepia" ? "active" : ""}
          onClick={() => setFilter("sepia")}
          aria-pressed={filter === "sepia"}
        >
          Sepia
        </button>
      </section>

      <main className="gallery" aria-live="polite">
        {images.length === 0 ? (
          <p className="empty-msg">No has subido ninguna imagen.</p>
        ) : (
          images.map((src, i) => <ZoomableImage key={i} src={src} filter={filter} />)
        )}
      </main>

      <footer className="footer">
        <p>© 2025 Everardo Padron Castillo - Proyecto Visor de Imágenes</p>
      </footer>
    </div>
  );
}

export default App;
