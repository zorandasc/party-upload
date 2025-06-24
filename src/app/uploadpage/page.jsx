"use client";
import Image from "next/image";
import React, { useState } from "react";
import imageCompression from "browser-image-compression";
import UploadDrop from "@/components/UploadDrop";
import styles from "./page.module.css";

const UploadPage = () => {
  const [images, setImages] = useState([]);

  //PRESENT USER UPLODADED IMAGES
  const handleOnUploadComplete = (res) => {
    alert("Upload Completed");
    const newImages = res?.map(({ customId, key, name, ufsUrl }) => {
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

  return (
    <>
      <section className={styles.uploadedImagesSmall}>
        {images?.map((item, i) => (
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
      <UploadDrop
        handleBeforeUpload={handleBeforeUpload}
        handleOnUploadComplete={handleOnUploadComplete}
      ></UploadDrop>
    </>
  );
};
export default UploadPage;
