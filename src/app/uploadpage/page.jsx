"use client";
import Image from "next/image";
import React, { useState } from "react";
import imageCompression from "browser-image-compression";
import UploadDrop from "@/components/UploadDrop";
import styles from "./page.module.css";

const UploadPage = () => {
  const [images, setImages] = useState([]);
  const [userName, setUserName] = useState("");

  //PRESENT USER UPLODADED IMAGES
  const handleOnUploadComplete = (res) => {
    alert("Upload Completed");
    const newImages = res?.map(({ customId, key, name, ufsUrl }) => {
      console.log("Image uploaded:", { customId, key, name, ufsUrl });
      return {
        customId,
        key,
        name,
        ufsUrl,
      };
    });
    setImages([...newImages, ...images]);
  };

  // COMPRES EACH FILE BEFORE UPLOADING
  const handleBeforeUpload = async (files) => {
    const compressedFiles = await Promise.all(
      files.map(async (file) => {
        try {
          const compressedFile = await imageCompression(file, {
            maxSizeMB: 1, // Maximum file size in MB
            maxWidthOrHeight: 1920, // Maximum width or height of the image
          });
          return compressedFile;
        } catch (error) {
          console.error("Error compressing file:", error);
          return file; // Return original file if compression fails
        }
      })
    );
    return compressedFiles;
  };

  //THIS WILL INCLUDE username TO INPUT
  //WHEN UploadDROP SEND REQUEST TO SERVER
  const inputForUploadthing = {
    userName: userName || "Anonymous",
  };

  return (
    <>
      <section className={styles.uploadedImagesSmall}>
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
      </section>
      <form className={styles.uploadForm}>
        <label className={styles.uploadLabel}>Unesite vaše ime</label>
        <input
          placeholder="Vaše ime"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          minLength="2"
          maxLength="20"
        />
      </form>
      <UploadDrop
        handleBeforeUpload={handleBeforeUpload}
        handleOnUploadComplete={handleOnUploadComplete}
        inputData={inputForUploadthing}
      ></UploadDrop>
    </>
  );
};
export default UploadPage;
