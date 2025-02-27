import { removeBackground } from "@imgly/background-removal";

export const processImage = async (imageUrl: string): Promise<string> => {
  try {
    // 1. Convert the data URL to a Blob
    const response = await fetch(imageUrl);
    const imageBlob = await response.blob();

    // 2. Remove the background
    const processedBlob = await removeBackground(imageBlob);

    // 3. Create an object URL from the processed blob
    const processedUrl = URL.createObjectURL(processedBlob);

    // 4. Load the processed image into an HTMLImageElement
    const img = new Image();
    img.src = processedUrl;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
    });

    // 5. Draw the processed image onto a canvas
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get 2D context for canvas.");
    ctx.drawImage(img, 0, 0);

    // 6. Get the bounding box of all non-transparent (above threshold) pixels
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const ALPHA_THRESHOLD = 20; // Adjust if you need more or less strict trimming

    let minX = canvas.width,
      minY = canvas.height,
      maxX = 0,
      maxY = 0;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const alpha = imageData.data[(y * canvas.width + x) * 4 + 3];
        if (alpha > ALPHA_THRESHOLD) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

    // 7. Handle case if image is fully transparent
    if (maxX < minX || maxY < minY) {
      console.warn("Image is fully transparent (or below threshold) after removal.");
      // Return the untrimmed result or a blank
      return processedUrl;
    }

    // 8. Calculate trimmed dimensions
    const trimmedWidth = maxX - minX + 1;
    const trimmedHeight = maxY - minY + 1;

    // 9. Create a new canvas for the trimmed image
    const trimmedCanvas = document.createElement("canvas");
    trimmedCanvas.width = trimmedWidth;
    trimmedCanvas.height = trimmedHeight;
    const trimmedCtx = trimmedCanvas.getContext("2d");
    if (!trimmedCtx)
      throw new Error("Could not get 2D context for trimmed canvas.");

    trimmedCtx.drawImage(
      canvas,
      minX,
      minY,
      trimmedWidth,
      trimmedHeight,
      0,
      0,
      trimmedWidth,
      trimmedHeight
    );

    // 10. Convert the trimmed canvas to a Data URL
    const finalDataUrl = trimmedCanvas.toDataURL();

    return finalDataUrl;
  } catch (error) {
    console.error("Error processing image:", error);
    throw new Error("Image processing failed: " + error);
  }
};
