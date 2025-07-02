"use client";
import { useEffect, useState } from "react";
import ImagesContainer from "@/components/ImagesContainer";
import { FaAngleDoubleRight, FaAngleDoubleLeft } from "react-icons/fa";
import styles from "./imagesGallery.module.css"; // Assuming you have some styles for the gallery

const LIMIT = 20;

//Imagegallery KOMBINUJE KOMPONENTU IMAGECONTAINER I PAGINACIJU
//THIS setPage(prev => prev + 1), MEANS Only allow user actions
//to update the page.
export default function ImageGallery() {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/images?limit=${LIMIT}&offset=${page * LIMIT}`
        );
        const data = await res.json();
        setImages(data.files);
        setHasMore(data.hasMore);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [page]);

  return (
    <>
      {loading ? (
        <div className={styles.spinnerContainer}>
          <div className={styles.spinner}></div>
        </div>
      ) : (
        <ImagesContainer images={images} />
      )}
      <div className={styles.paginationControls}>
        <button
          className={styles.paginationButton}
          onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          disabled={page === 0 || loading}
        >
          <FaAngleDoubleLeft />
        </button>
        <span style={{ margin: "0 1rem" }}>Page {page + 1}</span>
        <button
          className={styles.paginationButton}
          onClick={() => setPage((prev) => prev + 1)}
          disabled={!hasMore || loading}
        >
          <FaAngleDoubleRight />
        </button>
      </div>
    </>
  );
}
