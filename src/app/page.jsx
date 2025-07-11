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
  // IMPROVED FILE STABILIZATION FOR ANDROID CHROME
  const handleBeforeUpload = async (files) => {
    const processedFiles = [];

    for (const file of files) {
      try {
        // Enhanced file validation
        if (!file || file.size === 0 || !file.type) {
          toast.error("Odabrani fajl je nevažeći ili prazan.");
          console.warn("Skipping invalid file:", file.name);
          continue;
        }

        // Ensure it's an image before processing
        if (!file.type.startsWith("image/")) {
          console.warn(`Unsupported file type: ${file.name} (${file.type})`);
          toast.error(
            `"${file.name}" ima nepodržan format i neće biti poslan.`
          );
          continue;
        }

        console.log(
          `Processing: ${file.name}, Size: ${(
            file.size /
            (1024 * 1024)
          ).toFixed(2)} MB`
        );

        // ENHANCED FILE STABILIZATION - Multiple fallback strategies
        let stableFile;

        try {
          // Method 1: Modern approach (preferred)
          if (file.arrayBuffer) {
            const arrayBuffer = await file.arrayBuffer();
            stableFile = new File([arrayBuffer], file.name, {
              type: file.type,
              lastModified: file.lastModified,
            });
          } else {
            throw new Error("arrayBuffer not supported");
          }
        } catch (bufferError) {
          console.warn(
            "arrayBuffer method failed, trying FileReader:",
            bufferError
          );

          // Method 2: FileReader fallback for older browsers
          try {
            const arrayBuffer = await new Promise((resolve, reject) => {
              const reader = new FileReader();

              // Set timeout to prevent hanging
              const timeout = setTimeout(() => {
                reader.abort();
                reject(new Error("FileReader timeout"));
              }, 30000); // 30 second timeout

              reader.onload = () => {
                clearTimeout(timeout);
                resolve(reader.result);
              };

              reader.onerror = () => {
                clearTimeout(timeout);
                reject(
                  new Error(
                    `Failed to read file ${file.name}: ${
                      reader.error?.message || "Unknown error"
                    }`
                  )
                );
              };

              reader.onabort = () => {
                clearTimeout(timeout);
                reject(new Error("FileReader aborted"));
              };

              reader.readAsArrayBuffer(file);
            });

            stableFile = new File([arrayBuffer], file.name, {
              type: file.type,
              lastModified: file.lastModified,
            });
          } catch (readerError) {
            console.warn(
              "FileReader method failed, using original file:",
              readerError
            );
            // Method 3: Last resort - use original file with additional delay
            stableFile = new File([file], file.name, {
              type: file.type,
              lastModified: file.lastModified,
            });
            // Add extra delay for unstable file references
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
        }

        // Verify the stabilized file
        if (!stableFile || stableFile.size === 0) {
          toast.error(`Fajl "${file.name}" nije mogao biti obrađen.`);
          continue;
        }

        const sizeInMB = stableFile.size / (1024 * 1024);

        // Skip compression for small files
        if (sizeInMB < 2) {
          processedFiles.push(stableFile);
          continue;
        }

        // ENHANCED COMPRESSION with better error handling
        let compressedFile;
        const maxRetries = 2;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            // Add delay before compression attempts (especially important for mobile)
            if (attempt > 0) {
              await new Promise((resolve) =>
                setTimeout(resolve, 500 * attempt)
              );
            }

            compressedFile = await imageCompression(stableFile, {
              maxSizeMB: 4,
              maxWidthOrHeight: 4000,
              useWebWorker: true,
              initialQuality: 0.9,
              // Additional options for better mobile compatibility
              alwaysKeepResolution: false,
              exifOrientation: 1, // Handle EXIF orientation issues
            });

            console.log(
              `Compressed ${file.name}: ${sizeInMB.toFixed(2)}MB → ${(
                compressedFile.size /
                (1024 * 1024)
              ).toFixed(2)}MB`
            );
            break; // Success, exit retry loop
          } catch (compressionError) {
            console.warn(
              `Compression attempt ${attempt + 1} failed for ${file.name}:`,
              compressionError
            );

            if (attempt === maxRetries) {
              // All compression attempts failed
              console.error(`All compression attempts failed for ${file.name}`);

              // Check if original file is within limits
              const UPLOADTHING_MAX_SIZE_MB = 10;
              if (stableFile.size > UPLOADTHING_MAX_SIZE_MB * 1024 * 1024) {
                toast.error(
                  `"${file.name}" je prevelik i kompresija nije uspela.`
                );
                continue; // Skip this file
              }

              // Use original stable file if within limits
              compressedFile = stableFile;
              toast.error(
                `Kompresija za "${file.name}" nije uspela, koristi se originalni fajl.`
              );
              break;
            }
          }
        }

        // Final size check
        const UPLOADTHING_MAX_SIZE_MB = 10;
        if (compressedFile.size > UPLOADTHING_MAX_SIZE_MB * 1024 * 1024) {
          toast.error(
            `"${file.name}" je prevelik (${(
              compressedFile.size /
              (1024 * 1024)
            ).toFixed(2)} MB).`
          );
          continue;
        }

        processedFiles.push(compressedFile);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        toast.error(
          `Greška pri obradi fajla "${file.name}". Pokušajte ponovo.`
        );
        continue;
      }
    }

    // Enhanced delay for mobile stability
    await new Promise((resolve) => setTimeout(resolve, 200));

    return processedFiles;
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
        {images.length > 0 && (
          <button
            onClick={handleClearLocalStorage}
            className={styles.clearButton}
          >
            <FaTrashAlt></FaTrashAlt>
          </button>
        )}
      </section>

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
