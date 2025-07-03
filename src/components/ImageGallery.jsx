"use client";
import { useEffect, useState } from "react";

import ImagesContainer from "@/components/ImagesContainer";
import Paginator from "@/components/Paginator";
import Spinner from "@/components/Spinner";
import SideBar from "@/components/SideBar";

const LIMIT = 10;

//Imagegallery KOMBINUJE KOMPONENTU IMAGECONTAINER I PAGINACIJU
//THIS setPage(prev => prev + 1), MEANS Only allow user actions
//to update the page.
export default function ImageGallery() {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checkboxMode, setCheckboxMode] = useState(null); // 'trash' | 'share' | null
  
  const totalPages = Math.ceil(totalCount / LIMIT);

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
        setTotalCount(data.totalCount);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [page]);

  const handleLeftClick = () => setPage((prev) => Math.max(prev - 1, 0));

  const handleRightClick = () =>
    setPage((prev) => Math.min(prev + 1, totalPages - 1));

  const handleTrash = () =>
    setCheckboxMode((prev) => (prev === "trash" ? null : "trash"));

  const handleShare = () =>
    setCheckboxMode((prev) => (prev === "share" ? null : "share"));

  return (
    <>
      {loading ? (
        <Spinner></Spinner>
      ) : (
        <ImagesContainer images={images} checkboxMode={checkboxMode} />
      )}
      <SideBar
        handleTrash={handleTrash}
        handleShare={handleShare}
        checkboxMode={checkboxMode}
      ></SideBar>
      <Paginator
        loading={loading}
        page={page}
        totalPages={totalPages}
        hasMore={hasMore}
        handleLeftClick={handleLeftClick}
        handleRightClick={handleRightClick}
      ></Paginator>
    </>
  );
}
