import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";

const CapturePhoto = () => {
  const [photo, setPhoto] = useState(null);
  const webcamRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const capture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setPhoto(imageSrc);
    }
  };

  const handleSubmit = async () => {
    const order = {
      drinks: location.state?.selectedDrinks || [],
      photo,
    };

    console.log("Pedido com Foto:", order);
    alert("Pedido enviado com sucesso!");
    navigate("/"); // Volta para a página principal
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Capture a Foto</h2>
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        style={{ width: "300px", height: "300px" }}
      />
      <div>
        <button onClick={capture}>Capturar Foto</button>
        <button onClick={handleSubmit} disabled={!photo}>
          Enviar Pedido
        </button>
      </div>
      {photo && (
        <div>
          <h3>Pré-visualização:</h3>
          <img src={photo} alt="Preview" style={{ width: "300px" }} />
        </div>
      )}
    </div>
  );
};

export default CapturePhoto;
