import { removeBackground } from "@imgly/background-removal";

export const processImage = async (imageUrl: string): Promise<string> => {
    try {
      // Convert the data URL to a Blob
      const response = await fetch(imageUrl);
      const imageBlob = await response.blob();
  
      // Now remove the background from the Blob
      const processedBlob = await removeBackground(imageBlob);
      const processedUrl = URL.createObjectURL(processedBlob);
      return processedUrl;
    } catch (error) {
      console.error("Error processing image:", error);
      throw new Error("Image processing failed: " + error);
    }
  };
  