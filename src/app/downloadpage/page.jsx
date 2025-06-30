"use client";
import { useEffect, useState } from "react";
import { FaGift } from "react-icons/fa";
import styles from "./page.module.css";
import Ribbon from "@/components/Ribbon";

const DownloadPage = () => {
  const [zipCount, setZipCount] = useState(0);
  const [zipSizes, setZipSizes] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (zipCount === 0) return <p>Nema fajlova za download.</p>;

  return (
    <div className={styles.pageContainer}>
      <Ribbon text="Dobavite Vaše slike"></Ribbon>

      <ul className={styles.list}>
        {Array.from({ length: zipCount }).map((_, i) => (
          <li key={i} className={styles.listItem}>
            <a
              className={styles.link}
              href={`/api/download-zip?page=${i + 1}`}
              rel="noopener noreferrer"
            >
              <FaGift></FaGift> Download ZIP Part {i + 1} (
              {zipSizes[i]?.toFixed(1) ?? "?"} MB)
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DownloadPage;
