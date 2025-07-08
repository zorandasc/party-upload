"use client";
import { useEffect, useState } from "react";
import { FaGift, FaSpinner } from "react-icons/fa";

import styles from "./page.module.css";

import toast from "react-hot-toast";

import Ribbon from "@/components/Ribbon";
import Spinner from "@/components/Spinner";

const DownloadPage = () => {
  const [zipCount, setZipCount] = useState(0);
  const [zipSizes, setZipSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  //TO DISABLE BUTTON WHILE DOWNLOADING
  const [downloadingIndex, setDownloadingIndex] = useState(null);

  const downloadWithProgress = async (zipurl, index) => {
    setDownloadingIndex(index);
    const loadingToastId = toast.loading("Pripremamo ZIP, molim sačekajte...", {
      icon: <FaSpinner className={styles.tostSpinner} />,
      style: {
        marginTop: "7rem",
        borderRadius: "30px 0px 30PX 0",
        background: "rgba(255, 255, 255, 0.84)",
        backdropFilter: "blur(7.1px)",

        fontSize: "20px",
      },
    });

    try {
      const res = await fetch(zipurl);

      if (!res.ok) {
        // Handle HTTP errors (e.g., 400, 500 from your API)
        const errorText = await res.text(); // Get raw error message from server
        toast.dismiss(loadingToastId);
        toast.error(
          `Greška pri preuzimanju ZIP-a: ${res.status} ${
            errorText || res.statusText
          }`
        );
        return; // Stop execution
      }

      //.body: This is a property of the Response object. It returns a ReadableStream object.
      //.getReader(): This is a method of the ReadableStream object.
      // When called, it creates and returns a ReadableStreamDefaultReader object.
      const reader = res.body.getReader();
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          toast.dismiss(loadingToastId);
          toast.success("Download zavrsen uspijesno.");
          break;
        }

        chunks.push(value);
      }

      //RECONSTRUCT FILE
      const blob = new Blob(chunks, { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `images-part-${zipurl.split("page=")[1]}.zip`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Greška pri preuzimanju ZIP-a:", error);
      toast.dismiss(loadingToastId);
      toast.error(`Došlo je do neočekivane greške: ${error.message}`);
    } finally {
      //ENABLE DOWNLOAD BUTTON
      setDownloadingIndex(null);
    }
  };

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await fetch("/api/download-zip/meta");
        const data = await res.json();
        setZipCount(data.zipCount);
        setZipSizes(data.zipSizes);
      } catch (error) {
        console.error("Failed to fetch zip meta", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMeta();
  }, []);

  if (loading) return <Spinner></Spinner>;

  return (
    <div className={styles.pageContainer}>
      <Ribbon text="Matalija & Borivoje"></Ribbon>
      {zipCount === 0 ? (
        <p className={styles.list}>Nema fajlova za download.</p>
      ) : (
        <ul className={styles.list}>
          {Array.from({ length: zipCount }).map((_, i) => (
            <li key={i} className={styles.listItem}>
              <button
                className={styles.link}
                onClick={() =>
                  downloadWithProgress(`/api/download-zip?page=${i + 1}`, i)
                }
                disabled={downloadingIndex === i}
              >
                <FaGift></FaGift> Download ZIP Part {i + 1} (
                {zipSizes[i]?.toFixed(1) ?? "?"} MB)
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DownloadPage;
