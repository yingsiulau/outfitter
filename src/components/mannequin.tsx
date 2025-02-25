"use client"; // Required for state in Next.js App Router

import { useState, useEffect } from "react";
import { getPullovers, getShoes, getPants } from "../functions/clothIndex";
import { processImage } from "../functions/imageHelper";

export default function Mannequin() {
  const pullovers = getPullovers();
  const shoes = getShoes();
  const pants = getPants();

  // Sweater (Pullover) state
  const [currentPulliIndex, setCurrentPulliIndex] = useState(0);
  const [selectedPullover, setSelectedPullover] = useState(pullovers[0]);

  // Shoes state
  const [currentShoesIndex, setCurrentShoesIndex] = useState(0);
  const [selectedShoes, setSelectedShoes] = useState(shoes[0]);

  // Pants state
  const [currentPantsIndex, setCurrentPantsIndex] = useState(0);
  const [selectedPants, setSelectedPants] = useState(pants[0]);

  // Lock states for each item (0 = open, 1 = locked)
  const [sweaterLock, setSweaterLock] = useState(0);
  const [pantsLock, setPantsLock] = useState(0);
  const [shoesLock, setShoesLock] = useState(0);

  // Image Upload state (original image)
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  // Processed image state (result from outsourced processing)
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(
    null
  );
  // Modal visibility state for processed image popup
  const [modalVisible, setModalVisible] = useState(false);

  // Cutter
  const [split, setSplit] = useState(50); // Initial split at 50%

  // On mount, check if an image is stored in localStorage
  useEffect(() => {
    const storedImage = localStorage.getItem("uploadedImage");
    if (storedImage) {
      setUploadedImageUrl(storedImage);
    }
  }, []);

  // Process the uploaded image via the helper function when its URL changes
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
    }
  }, [uploadedImageUrl]);

  // Log lock values whenever they change
  useEffect(() => {
    console.log("Lock values:", {
      sweater: sweaterLock,
      pants: pantsLock,
      shoes: shoesLock,
    });
  }, [sweaterLock, pantsLock, shoesLock]);

  // Toggle functions for each lock
  const toggleSweaterLock = () =>
    setSweaterLock((prev) => (prev === 0 ? 1 : 0));
  const togglePantsLock = () => setPantsLock((prev) => (prev === 0 ? 1 : 0));
  const toggleShoesLock = () => setShoesLock((prev) => (prev === 0 ? 1 : 0));

  // Individual randomizers (avoiding the same item consecutively)
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

  // Randomize all clothing pieces if they're not locked.
  // Unlike the individual randomizers, this one can pick the same piece twice.
  const randomizeAll = () => {
    if (sweaterLock === 0) {
      const randomIndex = Math.floor(Math.random() * pullovers.length);
      setSelectedPullover(pullovers[randomIndex]);
      setCurrentPulliIndex(randomIndex);
    }
    if (pantsLock === 0) {
      const randomIndex = Math.floor(Math.random() * pants.length);
      setSelectedPants(pants[randomIndex]);
      setCurrentPantsIndex(randomIndex);
    }
    if (shoesLock === 0) {
      const randomIndex = Math.floor(Math.random() * shoes.length);
      setSelectedShoes(shoes[randomIndex]);
      setCurrentShoesIndex(randomIndex);
    }
  };

  // Image upload handling (the image is not displayed on the main page)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setUploadedImageUrl(result);
        // Store the image data in localStorage for persistence
        localStorage.setItem("uploadedImage", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setUploadedImageUrl(null);
    setProcessedImageUrl(null);
    localStorage.removeItem("uploadedImage");
  };

  const handleCutImage = (imageUrl: string) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (ctx) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        // Get the original dimensions of the image
        const imgWidth = img.width;
        const imgHeight = img.height;

        // Calculate the new height for the top and bottom parts based on the slider (split)
        const cutHeight = (split / 100) * imgHeight;

        // Create the top part (cut from 0 to split)
        const topHeight = cutHeight;
        canvas.width = imgWidth; // Canvas width remains the same as the original image
        canvas.height = topHeight; // Set canvas height to the top part's height
        ctx.drawImage(
          img,
          0,
          0,
          imgWidth,
          topHeight,
          0,
          0,
          imgWidth,
          topHeight
        );
        const topImageUrl = canvas.toDataURL(); // Top image as Data URL

        // Create the bottom part (cut from split to the bottom)
        const bottomHeight = imgHeight - cutHeight;
        canvas.height = bottomHeight; // Update canvas height for the bottom part
        ctx.clearRect(0, 0, imgWidth, bottomHeight); // Clear canvas before drawing the bottom part
        ctx.drawImage(
          img,
          0,
          cutHeight,
          imgWidth,
          bottomHeight,
          0,
          0,
          imgWidth,
          bottomHeight
        );
        const bottomImageUrl = canvas.toDataURL(); // Bottom image as Data URL

        // Log the resized images
        console.log("Top Image URL: ", topImageUrl);
        console.log("Bottom Image URL: ", bottomImageUrl);

        // Optionally, you can set the state with the new URLs to display them
        // setProcessedImageUrl(topImageUrl); // Example
        // setBottomImageUrl(bottomImageUrl); // Example
      };
    } else {
      console.error("2D context not supported or canvas already initialized");
    }
  };

  return (
    <div>
      <div className="mannequin-container flex flex-col items-center gap-4">
        {/* Mannequin */}
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

      {/* Button Menu with Lock Icons */}
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

      {/* Image Upload Widget (no preview shown on main page) */}
      <div className="imageUploadWidget">
        <h3>Upload an Image</h3>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {uploadedImageUrl && (
          <button onClick={handleRemoveImage} className="removeButton">
            Remove Image
          </button>
        )}
      </div>

      {/* Button to show the processed image as a popup widget (positioned on the right) */}
      <div className="processedImageButton">
        <button
          onClick={() => setModalVisible(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition"
          disabled={!processedImageUrl}
        >
          Show Processed Image
        </button>
      </div>

      {/* Modal Popup for Processed Image */}
      {modalVisible && processedImageUrl && (
        <div className="modalOverlay" onClick={() => setModalVisible(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <button
              className="closeButton"
              onClick={() => setModalVisible(false)}
            >
              Close
            </button>

            {/* Image Display Container */}
            <div className="relative w-full max-w-lg mx-auto">
              {/* Full Image with 70% viewport height */}
              <img
                src={processedImageUrl}
                alt="Processed"
                className="w-full object-cover"
                style={{ height: "70vh", objectFit: "contain" }} // Prevent cropping
              />

              {/* Helper Line (Red Line at Cut) */}
              <div
                className="absolute left-0 w-full h-1 bg-red-500"
                style={{ top: `${split}%` }} // Red line moves with the slider
              ></div>
            </div>

            {/* Slider to Adjust the Position of the Red Line */}
            <input
              type="range"
              min="0"
              max="100"
              value={split}
              onChange={(e) => setSplit(Number(e.target.value))}
              className="w-full mt-4"
            />

            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition mt-4"
              onClick={() => handleCutImage(processedImageUrl)}
            >
              Cut Image and Log New Images
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
