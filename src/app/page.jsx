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
    const compressedFiles = await Promise.all(
      files.map(async (file) => {
        try {
          if (file.size === 0) {
            toast.error("Odabrani fajl je nevažeći ili prazan.");
            console.warn("Skipping empty file:", file.name);
            return null;
          }

          //FIRST MAKY COPY OF ORGINAL TO PREVENT CRASHES ON ANDROID
          const fileCopy = new File([file], file.name, { type: file.type });

          const compressedFile = await imageCompression(fileCopy, {
            maxSizeMB: 2.5, // Aim below 4MB but keep quality decent
            maxWidthOrHeight: 1920, // Standard HD resolution is usually enough
            useWebWorker: true, // Improves performance
            initialQuality: 0.8,
          });
          if (compressedFile.size > 4 * 1024 * 1024) {
            // 4MB in bytes
            toast.error(
              `"${file.name}" je prevelik (${(
                compressedFile.size /
                (1024 * 1024)
              ).toFixed(2)} MB) i neće biti poslan.`
            );
            console.warn(
              `File "${file.name}" is still too large after compression: ${
                compressedFile.size / (1024 * 1024)
              } MB`
            );
            return null; // Return null to filter this file out
          }
          return compressedFile;
        } catch (error) {
          console.error("Error compressing file:", error);
          toast.error(`Greška pri kompresiji slike, ${file.name}`);
          return null;
        }
      })
    );
    return compressedFiles.filter(Boolean);
  };

  //PRESENT USER UPLODADED IMAGES AKO IH JE IMAO
  const handleOnUploadComplete = (res) => {
    const newImages = res?.map(({ customId, key, name, ufsUrl }) => {
      return {
        customId,
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

    toast.success(`Hvala! ${newImages.length} slike su poslane!`);

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
    } else {
      toast.error(message);
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
