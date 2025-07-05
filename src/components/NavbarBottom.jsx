"use client";
import React, { useState, useEffect } from "react";
import styles from "./navbarBottom.module.css"; // Adjust the path as necessary
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaUsers,
  FaCloudUploadAlt,
  FaCloudDownloadAlt,
} from "react-icons/fa";
import { useImageCount } from "@/context/ImageCountContext";

const NavbarBottom = () => {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { count } = useImageCount();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        const data = await res.json();
        setIsLoggedIn(data.isLoggedIn);
      } catch (error) {
        console.error("Auth check failed", error);
      }
    }
    checkAuth();
  }, []);
  return (
    <nav className={styles.nav}>
      <ul className={styles.menu}>
        {isLoggedIn && (
          <li
            className={`${styles.link} ${
              pathname === "/homepage" ? styles.active : ""
            }`}
          >
            <Link href="/homepage">
              <div className={styles.total}>{count}</div>
              <FaHome />
            </Link>
          </li>
        )}
        <li
          className={`${styles.link} ${
            pathname === "/sharedpage" ? styles.active : ""
          }`}
        >
          <Link href="/sharedpage">
            <FaUsers />
          </Link>
        </li>
        {isLoggedIn && (
          <li
            className={`${styles.link} ${
              pathname === "/downloadpage" ? styles.active : ""
            }`}
          >
            <Link href="/downloadpage">
              <FaCloudDownloadAlt />
            </Link>
          </li>
        )}

        <li
          className={`${styles.link} ${pathname === "/" ? styles.active : ""}`}
        >
          <Link href="/">
            <FaCloudUploadAlt />
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavbarBottom;
