"use client";

import styles from "./page.module.css";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaTrashAlt } from "react-icons/fa";

import imageCompression from "browser-image-compression";
import UploadDrop from "@/components/UploadDrop";

import Ribbon from "@/components/Ribbon";
import toast from "react-hot-toast";

import { useImageCount } from "@/context/ImageCountContext";

const UploadPage = () => {
  //INFORM CONTEXT OF ULOADED IMAGES
  const { setCount } = useImageCount();

  //UPLOADED IMAGES
  const [images, setImages] = useState([]);

  //OPCIONO IME USERA
  const [userName, setUserName] = useState("");

  //OVAJ KLJUC SE KORISTI DA SE RESETUJE UPLOADDROP
  //NAKON STO SE DOGODI GRESKA, JER AKO SE NE RESETUJE, OSTANE U GRESCI
  //React will re-render a component from scratch if its key changes.
  // You can use that trick to reset the dropzone:
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const storedImages = localStorage.getItem("uploadedImages");
    if (storedImages) {
      setImages(JSON.parse(storedImages));
    }
  }, []);

  // COMPRES EACH FILE BEFORE UPLOADING
  const handleBeforeUpload = async (files) => {
    const processedFiles = [];

    for (const file of files) {
      // Sequential processing
      try {
        // --- DEBUGGING: Log original file details ---
        /*
        console.log(
          `Processing file: ${file.name}, Type: ${file.type}, Size: ${(
            file.size /
            (1024 * 1024)
          ).toFixed(2)} MB`
        );
        */
        // --- END DEBUGGING ---

        if (file.size === 0) {
          toast.error("Odabrani fajl je nevažeći ili prazan.");
          console.warn("Skipping empty file:", file.name);
          continue; // Skip empty files
        }

        // Ensure it's an image before attempting compression
        if (!file.type.startsWith("image/")) {
          console.warn(
            `Unsupported file type detected, skipping: ${file.name} (${file.type})`
          );
          toast.error(
            `"${file.name}" ima nepodržan format i neće biti poslan.`
          );
          continue;
        }

        // --- NEW AGGRESSIVE FILE STABILIZATION ---
        // Read the file into an ArrayBuffer and create a new File object from it.
        // This forces the browser to create a fresh in-memory copy,
        // potentially bypassing underlying file reference issues.
        const arrayBuffer = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () =>
            reject(new Error(`Failed to read file ${file.name}`));
          reader.readAsArrayBuffer(file);
        });

        const stableFile = new File([arrayBuffer], file.name, {
          type: file.type,
          lastModified: file.lastModified,
        });
        // --- END NEW AGGRESSIVE FILE STABILIZATION ---

        const sizeInMB = stableFile.size / 1024 / 1024; // Use stableFile size

        // DONT COMPRESS if already small
        if (sizeInMB < 2) {
          processedFiles.push(stableFile); // Push stableFile directly
          continue;
        }

        // POKUSAJ KOMPRESIJU KLIJENT SIDE
        // Use the stableFile for compression
        const compressedFile = await imageCompression(stableFile, {
          // <-- Use stableFile here
          maxSizeMB: 4, // Aim below 4MB but keep quality decent
          maxWidthOrHeight: 4000, //
          useWebWorker: true, // Improves performance
          initialQuality: 0.9,
        });

        // Client-side check against Uploadthing's 10MB limit (from core.js)
        const UPLOADTHING_MAX_SIZE_MB = 10;
        if (compressedFile.size > UPLOADTHING_MAX_SIZE_MB * 1024 * 1024) {
          toast.error(
            `"${file.name}" je prevelik (${(
              compressedFile.size /
              (1024 * 1024)
            ).toFixed(2)} MB) i neće biti poslan.`
          );
          console.warn(
            `Image "${file.name}" is still too large after compression: ${(
              compressedFile.size /
              (1024 * 1024)
            ).toFixed(2)} MB`
          );
          continue; // Skip oversized files
        }

        console.log(
          `Compressed image ${file.name} from ${sizeInMB.toFixed(2)} MB to ${(
            compressedFile.size /
            (1024 * 1024)
          ).toFixed(2)} MB`
        );
        processedFiles.push(compressedFile);
      } catch (error) {
        // If compression fails, try to send the original file if it's within limits.
        // This is the fallback for when compression itself fails (e.g., ProgressEvent).
        console.error(`Error compressing file ${file.name}:`, error); // Log original file name

        const UPLOADTHING_MAX_SIZE_MB = 10; // Use the same max size as your core.js

        if (file.size > UPLOADTHING_MAX_SIZE_MB * 1024 * 1024) {
          // Check original file size
          toast.error(
            `${file.name} je prevelik i nije mogao biti obrađen. Molimo pokušajte ponovo.`
          );
          // If original file is too big, filter it out
          continue;
        }
        processedFiles.push(file); // Push original file if compression failed but it's within limits
      }
    }

    // --- Add a small delay before returning the files array ---
    // This might give the browser a moment to stabilize its internal file references.
    await new Promise((resolve) => setTimeout(resolve, 100)); // Wait 100ms

    return processedFiles; // No need for .filter(Boolean) with this structure
  };

  //PRESENT USER UPLODADED IMAGES AKO IH JE IMAO
  const handleOnUploadComplete = (res) => {
    const newImages = res?.map(({ key, name, ufsUrl }) => {
      return {
        key,
        name,
        ufsUrl,
      };
    });

    //INFORM CONTEXT
    setCount((prev) => prev + newImages.length);

    //ADD TO LOCALSTORAGE
    const updatedImages = [...newImages, ...images];

    setImages(updatedImages);

    if (newImages.length > 0) {
      toast.success(`Hvala! ${newImages.length} slike su poslane!`);
    }

    // Save to localStorage
    localStorage.setItem("uploadedImages", JSON.stringify(updatedImages));
  };

  //RESET UPLOADROP AKO SE DOGODILA GRESKA
  const handleUploadError = (error) => {
    console.error("Upload je propao, sa greskom:", error);
    setResetKey((prev) => prev + 1); // force reset

    // Default message fallback
    let message = "Nepoznata greška pri uploadu.";

    // If error is a string
    if (typeof error === "string") message = error;

    // If error is an object with a message
    if (typeof error === "object" && error?.message) message = error.message;

    if (message.toLowerCase().includes("filecountmismatch")) {
      toast.error("Prevelik broj fajlova. Max broj je 4 fajla.");
    } else if (message.toLowerCase().includes("filesizemismatch")) {
      toast.error(
        "Jedan ili više fajlova je prevelik. Max velična jednog fajla je 4MB."
      );
    } else if (message.toLowerCase().includes("invalid")) {
      toast.error("Ime mora biti od min 2 do 20 slova.");
    } else if (message.toLowerCase().includes("upload_failed")) {
      toast.error(
        "Upload nije uspeo. Pokušajte ponovo ili izaberite druge fajlove."
      );
    } else {
      toast.error(`${message}. Molim Vas pokusajte ponovo.`);
    }
  };

  //THIS WILL INCLUDE username TO INPUT for UploadDrop
  //WHEN UploadDROP SEND REQUEST TO SERVER FFOR customID
  const inputForUploadthing = {
    userName: userName || "Gost",
  };

  const handleClearLocalStorage = () => {
    localStorage.removeItem("uploadedImages");
    setImages([]); // Clear from state too
    toast.success("Slike su obrisane iz vaše istorije.");
  };

  return (
    <div className={styles.pageContainer}>
      <Ribbon text="Matalija & Borivoje"></Ribbon>
      <section className={styles.uploadedImagesSmall}>
        {images.length > 0 ? (
          <>
            {images?.map((item, i) => (
              // Display each uploaded image
              <div key={i} className={styles.imagesContainer}>
                <Image
                  priority
                  src={item.ufsUrl}
                  blurDataURL={item.ufsUrl}
                  placeholder="blur"
                  alt="image"
                  layout="fill"
                  sizes="100%"
                  className={styles.image}
                ></Image>
              </div>
            ))}
          </>
        ) : (
          <div className={styles.quoteContainer}>
            <p className={styles.quote}>
              Hvala vam što ste deo naše priče i što sa nama delite radost ovog
              dana.
            </p>
          </div>
        )}
      </section>
      {images.length > 0 && (
        <button
          onClick={handleClearLocalStorage}
          className={styles.clearButton}
        >
          <FaTrashAlt></FaTrashAlt>
        </button>
      )}
      <form className={styles.uploadForm}>
        <input
          id="userName"
          placeholder="Vaše ime (Opciono)"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          minLength="2"
          maxLength="20"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.7)" }}
        />
      </form>
      <UploadDrop
        resetKey={resetKey}
        handleBeforeUpload={handleBeforeUpload}
        handleOnUploadComplete={handleOnUploadComplete}
        inputData={inputForUploadthing}
        onUploadError={handleUploadError}
      ></UploadDrop>
    </div>
  );
};
export default UploadPage;
