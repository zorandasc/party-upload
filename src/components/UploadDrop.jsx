"use client";
import { generateUploadDropzone } from "@uploadthing/react";
import styles from "./uploadDrop.module.css";

const UploadDropzone = generateUploadDropzone();

const UploadDrop = ({
  handleOnUploadComplete,
  handleBeforeUpload,
  inputData,
  resetKey,
  onUploadError,
}) => {
  return (
    <UploadDropzone
      key={resetKey}
      className={styles.uploadDropZone}
      endpoint="multipleImageUploader"
      onBeforeUploadBegin={handleBeforeUpload}
      onClientUploadComplete={handleOnUploadComplete}
      input={inputData}
      onUploadError={onUploadError}
      appearance={{
        label: styles.label,
        uploadIcon: styles.uploadIcon,
        allowedContent: styles.allowedContent,
        button: styles.uploadButton,
      }}
    ></UploadDropzone>
  );
};

export default UploadDrop;
