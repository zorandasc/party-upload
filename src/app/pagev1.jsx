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
    console.log(
      "UploadThing onBeforeUploadBegin triggered with files:",
      files.length
    );

    // Add a small delay to let the browser settle
    await new Promise((resolve) => setTimeout(resolve, 100));

    const processedFiles = [];
    const maxRetries = 3;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let success = false;
      let finalFile = null;

      // Try multiple times with different strategies
      for (let attempt = 0; attempt < maxRetries && !success; attempt++) {
        try {
          console.log(
            `Processing ${file.name} - Attempt ${attempt + 1}/${maxRetries}`
          );

          // Progressive delay between attempts
          if (attempt > 0) {
            await new Promise((resolve) => setTimeout(resolve, 200 * attempt));
          }

          // Validate file
          if (!file || file.size === 0 || !file.type) {
            throw new Error("Invalid file detected");
          }

          if (!file.type.startsWith("image/")) {
            console.warn(`Skipping non-image file: ${file.name}`);
            toast.error(`"${file.name}" nije slika i neće biti poslana.`);
            break; // Don't retry for non-images
          }

          // FILE STABILIZATION - Try different methods based on attempt
          let stableFile;

          if (attempt === 0) {
            // Attempt 1: Modern approach
            try {
              const arrayBuffer = await file.arrayBuffer();
              stableFile = new File([arrayBuffer], file.name, {
                type: file.type,
                lastModified: file.lastModified,
              });
            } catch (bufferError) {
              throw new Error("Modern approach failed: " + bufferError.message);
            }
          } else if (attempt === 1) {
            // Attempt 2: FileReader approach
            try {
              const arrayBuffer = await new Promise((resolve, reject) => {
                const reader = new FileReader();

                const timeout = setTimeout(() => {
                  reader.abort();
                  reject(new Error("FileReader timeout"));
                }, 15000); // 15 second timeout

                reader.onload = () => {
                  clearTimeout(timeout);
                  resolve(reader.result);
                };

                reader.onerror = () => {
                  clearTimeout(timeout);
                  reject(
                    new Error(
                      `FileReader error: ${reader.error?.message || "Unknown"}`
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
              throw new Error(
                "FileReader approach failed: " + readerError.message
              );
            }
          } else {
            // Attempt 3: Direct copy approach (last resort)
            try {
              stableFile = new File([file], file.name, {
                type: file.type,
                lastModified: file.lastModified,
              });
              // Add extra delay for unstable references
              await new Promise((resolve) => setTimeout(resolve, 500));
            } catch (copyError) {
              throw new Error("Direct copy failed: " + copyError.message);
            }
          }

          // Verify stabilized file
          if (!stableFile || stableFile.size === 0) {
            throw new Error("Stabilized file is invalid");
          }

          const sizeInMB = stableFile.size / (1024 * 1024);

          // Skip compression for small files
          if (sizeInMB < 2) {
            finalFile = stableFile;
            success = true;
            continue;
          }

          // COMPRESSION with retry logic
          let compressedFile = null;
          const compressionRetries = 2;

          for (
            let compAttempt = 0;
            compAttempt < compressionRetries;
            compAttempt++
          ) {
            try {
              // Create a fresh file reference for each compression attempt
              const freshFile = new File([stableFile], stableFile.name, {
                type: stableFile.type,
                lastModified: stableFile.lastModified,
              });

              compressedFile = await imageCompression(freshFile, {
                maxSizeMB: 4,
                maxWidthOrHeight: 4000,
                useWebWorker: true,
                initialQuality: 0.9,
                alwaysKeepResolution: false,
                exifOrientation: 1,
              });

              console.log(
                `Compressed ${file.name}: ${sizeInMB.toFixed(2)}MB → ${(
                  compressedFile.size /
                  (1024 * 1024)
                ).toFixed(2)}MB`
              );
              break; // Compression successful
            } catch (compressionError) {
              console.warn(
                `Compression attempt ${compAttempt + 1} failed:`,
                compressionError
              );

              if (compAttempt === compressionRetries - 1) {
                // All compression attempts failed
                const UPLOADTHING_MAX_SIZE_MB = 10;
                if (stableFile.size <= UPLOADTHING_MAX_SIZE_MB * 1024 * 1024) {
                  //USE ORGINAL FILE IF LESS THAN 10MB
                  compressedFile = stableFile;
                  console.warn(
                    `Using original file for ${file.name} - compression failed`
                  );
                } else {
                  throw new Error(
                    `File too large and compression failed: ${file.name}`
                  );
                }
              } else {
                // Wait before retry
                await new Promise((resolve) => setTimeout(resolve, 500));
              }
            }
          }

          // Final size check
          const UPLOADTHING_MAX_SIZE_MB = 10;
          if (compressedFile.size > UPLOADTHING_MAX_SIZE_MB * 1024 * 1024) {
            throw new Error(
              `File too large: ${(compressedFile.size / (1024 * 1024)).toFixed(
                2
              )}MB`
            );
          }

          finalFile = compressedFile;
          success = true;
        } catch (error) {
          console.error(
            `Attempt ${attempt + 1} failed for ${file.name}:`,
            error.message
          );

          // Don't retry for certain errors
          if (
            error.message.includes("nije slika") ||
            error.message.includes("File too large") ||
            error.message.includes("non-image")
          ) {
            break;
          }

          // If this is the last attempt, show error
          if (attempt === maxRetries - 1) {
            toast.error(
              `Fajl "${file.name}" nije mogao biti obrađen. Pokušajte ponovo.`
            );
          }
        }
      }

      // Add successfully processed file
      if (success && finalFile) {
        processedFiles.push(finalFile);
      }
    }

    console.log(
      `Successfully processed ${processedFiles.length}/${files.length} files`
    );

    // If no files were processed successfully, throw error to prevent upload
    if (processedFiles.length === 0) {
      throw new Error("Nijedan fajl nije uspešno obrađen");
    }

    // Final stabilization delay
    await new Promise((resolve) => setTimeout(resolve, 300));

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
    console.error("Upload failed with error:", error);
    setResetKey((prev) => prev + 1);

    let message = "Nepoznata greška pri uploadu.";

    if (typeof error === "string") message = error;
    if (typeof error === "object" && error?.message) message = error.message;

    console.log("Error message:", message);

    // Enhanced error handling with specific guidance
    if (
      message.includes("NotReadableError") ||
      message.includes("ERR_UPLOAD_FILE_CHANGED")
    ) {
      toast.error(
        "Problem sa čitanjem fajla. Pokušajte da:\n1. Sačekajte 10 sekundi\n2. Izaberite iste fajlove ponovo"
      );
    } else if (message.includes("UPLOAD_FAILED")) {
      toast.error(
        "Upload nije uspeo. Pokušajte da:\n1. Proverite internet konekciju\n2. Sačekajte trenutak i pokušajte ponovo"
      );
    } else if (message.includes("ERR_UPLOAD_FILE_CHANGED")) {
      toast.error(
        "Fajl se promenio tokom upload-a. Molimo izaberite fajlove ponovo i pokušajte odmah."
      );
    } else if (message.includes("filecountmismatch")) {
      toast.error("Prevelik broj fajlova. Maksimalno 4 fajla.");
    } else if (message.includes("filesizemismatch")) {
      toast.error(
        "Jedan ili više fajlova je prevelik. Maksimalna veličina je 4MB."
      );
    } else if (message.includes("invalid")) {
      toast.error("Ime mora biti od 2 do 20 slova.");
    } else if (message.includes("Nijedan fajl nije uspešno obrađen")) {
      toast.error(
        "Fajlovi nisu mogli biti obrađeni. Pokušajte sa drugim fajlovima."
      );
    } else {
      toast.error(`Greška: ${message}\nPokušajte ponovo.`);
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
