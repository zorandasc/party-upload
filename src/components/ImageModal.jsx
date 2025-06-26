"use client";

import styles from "./imageModal.module.css";
import Image from "next/image";
import { FaTimes } from "react-icons/fa";

export default function ImageModal({ imageUrl, onClose }) {
  if (!imageUrl) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <FaTimes />
        </button>
        <Image
          priority
          src={imageUrl}
          alt="Image"
          fill
          sizes="80vw"
          className={styles.modalImage}
          blurDataURL={imageUrl}
          placeholder="blur"
        />
      </div>
    </div>
  );
}
