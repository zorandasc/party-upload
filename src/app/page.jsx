"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import imageCompression from "browser-image-compression";
import UploadDrop from "@/components/UploadDrop";
import Ribbon from "@/components/Ribbon";
import toast from "react-hot-toast";
import styles from "./page.module.css";

const UploadPage = () => {
  const [images, setImages] = useState([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const storedImages = localStorage.getItem("uploadedImages");
    if (storedImages) {
      setImages(JSON.parse(storedImages));
    }
  }, []);

  //PRESENT USER UPLODADED IMAGES
  const handleOnUploadComplete = (res) => {
    toast.success("Hvala! Slike su poslane!");
    const newImages = res?.map(({ customId, key, name, ufsUrl }) => {
      return {
        customId,
        key,
        name,
        ufsUrl,
      };
    });

    const updatedImages = [...newImages, ...images];

    setImages(updatedImages);

    // Save to localStorage
    localStorage.setItem("uploadedImages", JSON.stringify(updatedImages));
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

  //THIS WILL INCLUDE username TO INPUT for UploadDrop
  //WHEN UploadDROP SEND REQUEST TO SERVER
  const inputForUploadthing = {
    userName: userName || "Gost",
  };

  return (
    <div className={styles.pageContainer}>
      <Ribbon text="Upload Party"></Ribbon>
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
        <label className={styles.uploadLabel} htmlFor="userName">
          Unesite Vaše ime (Opciono)
        </label>
        <input
          id="userName"
          placeholder="Vaše ime"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          minLength="2"
          maxLength="20"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.7)" }}
        />
      </form>
      <UploadDrop
        handleBeforeUpload={handleBeforeUpload}
        handleOnUploadComplete={handleOnUploadComplete}
        inputData={inputForUploadthing}
      ></UploadDrop>
    </div>
  );
};
export default UploadPage;
