"use client";
import { useEffect, useState } from "react";

import ImagesContainer from "@/components/ImagesContainer";
import Paginator from "@/components/Paginator";
import Spinner from "@/components/Spinner";
import SideBar from "@/components/SideBar";

//Imagegallery KOMBINUJE KOMPONENTU IMAGECONTAINER I PAGINACIJU
//THIS setPage(prev => prev + 1), MEANS Only allow user actions
//to update the page.
export default function ImageGallery({ filter = {}, sharedOnly = false }) {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checkboxMode, setCheckboxMode] = useState(null); // 'trash' | 'share' | null

  const LIMIT = 10;
  const totalPages = Math.ceil(totalCount / LIMIT);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          limit: LIMIT,
          offset: page * LIMIT,
          ...filter,
        });
        const baseUrl = sharedOnly ? "/api/shared-images" : "/api/images";

        const res = await fetch(`${baseUrl}?${params.toString()}`);
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
  }, [page, sharedOnly, JSON.stringify(filter)]); // re-fetch if filter changes

  const handleLeftClick = () => setPage((prev) => Math.max(prev - 1, 0));

  const handleRightClick = () =>
    setPage((prev) => Math.min(prev + 1, totalPages - 1));

  const handleTrashButton = () =>
    setCheckboxMode((prev) => (prev === "trash" ? null : "trash"));

  const handleShareButton = () =>
    setCheckboxMode((prev) => (prev === "share" ? null : "share"));

  return (
    <>
      {loading ? (
        <Spinner></Spinner>
      ) : (
        <ImagesContainer images={images} checkboxMode={checkboxMode} />
      )}
      {!sharedOnly && (
        <SideBar
          handleTrash={handleTrashButton}
          handleShare={handleShareButton}
          checkboxMode={checkboxMode}
        />
      )}
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
