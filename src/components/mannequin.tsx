"use client";

import { useState, useEffect, useRef } from "react";
import { getPullovers, getShoes, getPants } from "../functions/clothIndex";
import { processImage } from "../functions/imageHelper";

export default function Mannequin() {
  const pullovers = getPullovers();
  const shoes = getShoes();
  const pants = getPants();

  // Clothing state
  const [currentPulliIndex, setCurrentPulliIndex] = useState(0);
  const [selectedPullover, setSelectedPullover] = useState(pullovers[0]);
  const [currentShoesIndex, setCurrentShoesIndex] = useState(0);
  const [selectedShoes, setSelectedShoes] = useState(shoes[0]);
  const [currentPantsIndex, setCurrentPantsIndex] = useState(0);
  const [selectedPants, setSelectedPants] = useState(pants[0]);

  // Lock states
  const [sweaterLock, setSweaterLock] = useState(0);
  const [pantsLock, setPantsLock] = useState(0);
  const [shoesLock, setShoesLock] = useState(0);

  // Image states
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(
    null
  );

  // Modal visibility
  const [modalVisible, setModalVisible] = useState(false);

  // Dimensions for the processed image
  const [naturalWidth, setNaturalWidth] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);
  const [displayedWidth, setDisplayedWidth] = useState(0);
  const [displayedHeight, setDisplayedHeight] = useState(0);

  // State for cuts
  const [topCut, setTopCut] = useState(0); // Initial topCut value (25% of displayHeight)
  const [midCut, setMidCut] = useState(displayedHeight * 0.5); // Initial midCut value (50% of displayHeight)
  const [bottomCut, setBottomCut] = useState(displayedHeight); // Initial bottomCut value (75% of displayHeight)

  // Adjusted min and max values for each cut
  const tenPercent = displayedHeight * 0.1; // 10% of displayedHeight
  const topCutMin = 0;
  const topCutMax = midCut - tenPercent;

  const midCutMin = topCut + tenPercent;
  const midCutMax = bottomCut - tenPercent;

  const bottomCutMin = midCut + tenPercent;
  const bottomCutMax = displayedHeight;

  // Cropped images
  const [croppedHoodieImage, setCroppedHoodieImage] = useState<string | null>(
    null
  );
  const [croppedPantsImage, setCroppedPantsImage] = useState<string | null>(
    null
  );

  // On mount, retrieve stored image
  useEffect(() => {
    const storedImage = localStorage.getItem("uploadedImage");
    if (storedImage) {
      setUploadedImageUrl(storedImage);
    }
  }, []);

  // Process image whenever uploadedImageUrl changes
  useEffect(() => {
    if (uploadedImageUrl) {
      (async () => {
        try {
          const processed = await processImage(uploadedImageUrl);
          setProcessedImageUrl(processed);
        } catch (error) {
          console.error("Error processing image:", error);
        }
      })();
      console.log("processed");
    }
  }, [uploadedImageUrl]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = modalVisible ? "hidden" : "";
  }, [modalVisible]);

  // Toggle lock
  const toggleSweaterLock = () =>
    setSweaterLock((prev) => (prev === 0 ? 1 : 0));
  const togglePantsLock = () => setPantsLock((prev) => (prev === 0 ? 1 : 0));
  const toggleShoesLock = () => setShoesLock((prev) => (prev === 0 ? 1 : 0));

  // Randomizers
  const changePullover = () => {
    if (pullovers.length < 2) return;
    let randomIndex = Math.floor(Math.random() * pullovers.length);
    while (randomIndex === currentPulliIndex) {
      randomIndex = Math.floor(Math.random() * pullovers.length);
    }
    setSelectedPullover(pullovers[randomIndex]);
    setCurrentPulliIndex(randomIndex);
  };

  const changePants = () => {
    if (pants.length < 2) return;
    let randomIndex = Math.floor(Math.random() * pants.length);
    while (randomIndex === currentPantsIndex) {
      randomIndex = Math.floor(Math.random() * pants.length);
    }
    setSelectedPants(pants[randomIndex]);
    setCurrentPantsIndex(randomIndex);
  };

  const changeShoes = () => {
    if (shoes.length < 2) return;
    let randomIndex = Math.floor(Math.random() * shoes.length);
    while (randomIndex === currentShoesIndex) {
      randomIndex = Math.floor(Math.random() * shoes.length);
    }
    setSelectedShoes(shoes[randomIndex]);
    setCurrentShoesIndex(randomIndex);
  };

  const randomizeAll = () => {
    if (sweaterLock === 0) {
      const r1 = Math.floor(Math.random() * pullovers.length);
      setSelectedPullover(pullovers[r1]);
      setCurrentPulliIndex(r1);
    }
    if (pantsLock === 0) {
      const r2 = Math.floor(Math.random() * pants.length);
      setSelectedPants(pants[r2]);
      setCurrentPantsIndex(r2);
    }
    if (shoesLock === 0) {
      const r3 = Math.floor(Math.random() * shoes.length);
      setSelectedShoes(shoes[r3]);
      setCurrentShoesIndex(r3);
    }
  };

  // Image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setUploadedImageUrl(result);
        localStorage.setItem("uploadedImage", result);
      };
      reader.readAsDataURL(file);
      console.log("uploaded");
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setUploadedImageUrl(null);
    setProcessedImageUrl(null);
    localStorage.removeItem("uploadedImage");
  };

  // Cropping logic
  const handleCutImage = (imageUrl: string) => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      if (naturalHeight === 0 || displayedHeight === 0) {
        console.error("Image dimension info not available yet.");
        return;
      }
      if (!(topCut < midCut && midCut < bottomCut)) {
        console.error("Invalid crop positions: ensure top < mid < bottom.");
        return;
      }

      // Convert from displayed coords to natural coords
      const ratio = naturalHeight / displayedHeight;
      const topY = topCut * ratio;
      const midY = midCut * ratio;
      const bottomY = bottomCut * ratio;

      // Crop hoodie
      const hoodieHeight = midY - topY;
      const canvasHoodie = document.createElement("canvas");
      canvasHoodie.width = img.width;
      canvasHoodie.height = hoodieHeight;
      const ctxHoodie = canvasHoodie.getContext("2d");
      if (ctxHoodie) {
        ctxHoodie.drawImage(
          img,
          0,
          topY,
          img.width,
          hoodieHeight,
          0,
          0,
          img.width,
          hoodieHeight
        );
        setCroppedHoodieImage(canvasHoodie.toDataURL());
      }

      // Crop pants
      const pantsHeight = bottomY - midY;
      const canvasPants = document.createElement("canvas");
      canvasPants.width = img.width;
      canvasPants.height = pantsHeight;
      const ctxPants = canvasPants.getContext("2d");
      if (ctxPants) {
        ctxPants.drawImage(
          img,
          0,
          midY,
          img.width,
          pantsHeight,
          0,
          0,
          img.width,
          pantsHeight
        );
        setCroppedPantsImage(canvasPants.toDataURL());
      }
    };
  };

  const handleTopCutChange = (e: any) => {
    const newTopCut = Number(e.target.value);
    console.log(newTopCut);
    console.log(displayedHeight);
    setTopCut(newTopCut);

    // Ensure midCut and bottomCut stay within valid ranges
    setMidCut(Math.max(midCut, newTopCut + tenPercent)); // midCut can't go below topCut + 10%
    setBottomCut(Math.max(bottomCut, midCut + tenPercent)); // bottomCut can't go below midCut + 10%
  };

  const handleMidCutChange = (e: any) => {
    const newMidCut = Number(e.target.value);
    setMidCut(newMidCut);

    // Ensure bottomCut stays valid
    setBottomCut(Math.max(bottomCut, newMidCut + tenPercent)); // bottomCut can't go below midCut + 10%
  };

  const handleBottomCutChange = (e: any) => {
    const newBottomCut = Number(e.target.value);
    setBottomCut(newBottomCut);
  };

  return (
    <div>
      {/* Mannequin Display */}
      <div className="mannequin-container flex flex-col items-center gap-4">
        <div className="mannequin">
          <div className="mannequin-head"></div>
          <div className="mannequin-torso">
            <img
              className="Pulli"
              src={selectedPullover.path}
              alt={selectedPullover.name}
            />
          </div>
          <div className="mannequin-legs">
            <img
              className="Houses"
              src={selectedPants.path}
              alt={selectedPants.name}
            />
          </div>
          <div className="mannequin-feet">
            <img
              className="Shoes"
              src={selectedShoes.path}
              alt={selectedShoes.name}
            />
          </div>
        </div>
      </div>

      {/* Button Menu */}
      <div className="buttonMenu">
        <div className="buttonRow">
          <button
            onClick={changePullover}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition"
          >
            Randomize Sweater
          </button>
          <span
            onClick={toggleSweaterLock}
            className={`lockIcon ${sweaterLock === 1 ? "closed" : "open"}`}
          >
            {sweaterLock === 1 ? "🔒" : "🔓"}
          </span>
        </div>
        <div className="buttonRow">
          <button
            onClick={changePants}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition"
          >
            Randomize Pants
          </button>
          <span
            onClick={togglePantsLock}
            className={`lockIcon ${pantsLock === 1 ? "closed" : "open"}`}
          >
            {pantsLock === 1 ? "🔒" : "🔓"}
          </span>
        </div>
        <div className="buttonRow">
          <button
            onClick={changeShoes}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition"
          >
            Randomize Shoes
          </button>
          <span
            onClick={toggleShoesLock}
            className={`lockIcon ${shoesLock === 1 ? "closed" : "open"}`}
          >
            {shoesLock === 1 ? "🔒" : "🔓"}
          </span>
        </div>
      </div>

      {/* Image Upload Widget */}
      <div className="imageUploadWidget">
        <h3>Upload an Image</h3>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {uploadedImageUrl && (
          <button onClick={handleRemoveImage} className="removeButton">
            Remove Image
          </button>
        )}
      </div>

      {/* Show Processed Image Button */}
      <div className="processedImageButton">
        <button
          onClick={() => setModalVisible(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition"
          disabled={!processedImageUrl}
        >
          Show Processed Image
        </button>

        <div>
          {!processedImageUrl ? (
            <div>No image</div>
          ) : (
            <span>image available</span>
          )}
        </div>
      </div>

      {/* Modal Popup */}
      {modalVisible && processedImageUrl && (
        <div
          className="modalOverlay"
          onClick={() => setModalVisible(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modalContent"
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "flex",
              width: "90vw",
              height: "90vh",
              backgroundColor: "#333",
              color: "#fff",
              borderRadius: "0.5rem",
              overflow: "hidden",
            }}
          >
            {/* Left Column (Store Items) */}
            <div
              style={{
                flex: "1 1 50%",
                padding: "1rem",
                overflowY: "auto",
                boxSizing: "border-box",
              }}
            >
              {croppedHoodieImage && (
                <div
                  style={{
                    border: "2px solid #777",
                    borderRadius: "8px",
                    backgroundColor: "#444",
                    padding: "0.5rem",
                    marginBottom: "1rem",
                    textAlign: "center",
                  }}
                >
                  <h3 style={{ marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                    Hoodie Crop
                  </h3>
                  <img
                    src={croppedHoodieImage}
                    alt="Hoodie Crop"
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: "150px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              )}
              {croppedPantsImage && (
                <div
                  style={{
                    border: "2px solid #777",
                    borderRadius: "8px",
                    backgroundColor: "#444",
                    padding: "0.5rem",
                    textAlign: "center",
                  }}
                >
                  <h3 style={{ marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                    Pants Crop
                  </h3>
                  <img
                    src={croppedPantsImage}
                    alt="Pants Crop"
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: "150px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              )}

              {/* Buttons */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={() => handleCutImage(processedImageUrl!)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#3b82f6",
                    color: "#fff",
                    border: "none",
                    borderRadius: "0.375rem",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                  }}
                >
                  Cut & Update
                </button>
                <button
                  onClick={() => setModalVisible(false)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#3b82f6",
                    color: "#fff",
                    border: "none",
                    borderRadius: "0.375rem",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Right Column (Processed Image) */}
            <div
              style={{
                flex: "1 1 50%",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  flex: 1,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <img
                  src={processedImageUrl}
                  alt="Processed"
                  style={{
                    position: "absolute",
                    margin: "auto",
                    top: "0",
                    left: "0",
                    bottom: "0",
                    right: "0",
                    width: "auto",
                    height: "100%",
                    objectFit: "contain",
                  }}
                  onLoad={(e) => {
                    const imgElem = e.currentTarget;
                    const rect = imgElem.getBoundingClientRect();
                    setNaturalWidth(imgElem.naturalWidth);
                    setNaturalHeight(imgElem.naturalHeight);
                    setDisplayedWidth(rect.width);
                    setDisplayedHeight(rect.height);
                    setTopCut(rect.height * 0.1); // Starting at 10% for top
                    setMidCut(rect.height * 0.2); // Starting at 20% for mid
                    setBottomCut(rect.height * 0.3); // Starting at 30% for bottom
                  }}
                />

                {/* Red cropping lines */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    width: "100%",
                    height: "2px",
                    backgroundColor: "red",
                    top: `${topCut}px`,
                  }}
                ></div>
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    width: "100%",
                    height: "2px",
                    backgroundColor: "red",
                    top: `${midCut}px`,
                  }}
                ></div>
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    width: "100%",
                    height: "2px",
                    backgroundColor: "red",
                    top: `${bottomCut}px`,
                  }}
                ></div>

                {/* Overlays for non-selected regions */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${topCut}px`,
                    backgroundColor: "rgba(0,0,0,0.3)",
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: `${bottomCut}px`,
                    left: 0,
                    width: "100%",
                    height: `calc(100% - ${bottomCut}px)`,
                    backgroundColor: "rgba(0,0,0,0.3)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>

            {/* Middle Column (Overlaid Controls) */}
            <div
              style={{
                position: "absolute",
                right: 100,
                width: "calc(44vw)",
                height: "calc(100% - 150px)",
                justifyContent: "space-between",
                zIndex: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "end",
                  width: "100%",
                  marginBottom: "1rem",
                }}
              >
                {/* Top Slider */}
                <div        style={{
                      height: displayedHeight * 0.333,
                    }}>
                  <input
                    type="range"
                    min={topCutMin}
                    max={topCutMax}
                    value={topCut}
                    onChange={handleTopCutChange}
                    style={{
                      transform: "rotate(90deg)",
                      height: displayedHeight * 0.333,
                    }}
                  />
                </div>

                {/* Mid Slider */}
                <div>
                  <input
                    type="range"
                    min={midCutMin}
                    max={midCutMax}
                    value={midCut}
                    onChange={handleMidCutChange}
                    style={{
                      transform: "rotate(90deg)",
                      height: displayedHeight * 0.333,
                    }}
                  />
                </div>

                {/* Bottom Slider */}
                <div>
                  <input
                    type="range"
                    min={bottomCutMin}
                    max={bottomCutMax}
                    value={bottomCut}
                    onChange={handleBottomCutChange}
                    style={{
                      transform: "rotate(90deg)",
                      height: displayedHeight * 0.333,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
