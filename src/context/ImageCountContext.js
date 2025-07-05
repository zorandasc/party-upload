// /context/ImageCountContext.js
"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ImageCountContext = createContext();

export function useImageCount() {
  return useContext(ImageCountContext);
}

export function ImageCountProvider({ children }) {
  const [count, setCount] = useState(null);

  // Initial fetch
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/image-count");
        const data = await res.json();
        setCount(data.count);
      } catch (err) {
        console.error("Failed to fetch image count", err);
      }
    };

    fetchCount();
  }, []);

  return (
    <ImageCountContext.Provider value={{ count, setCount }}>
      {children}
    </ImageCountContext.Provider>
  );
}
