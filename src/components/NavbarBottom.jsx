"use client";
import React from "react";
import styles from "./navbarBottom.module.css"; // Adjust the path as necessary
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaUsers,
  FaCloudUploadAlt,
  FaCloudDownloadAlt,
} from "react-icons/fa";

const NavbarBottom = () => {
  const pathname = usePathname();
  return (
    <nav className={styles.nav}>
      <ul className={styles.menu}>
        <li
          className={`${styles.link} ${pathname === "/" ? styles.active : ""}`}
        >
          <Link href="/">
            <FaHome />
          </Link>
        </li>
        <li
          className={`${styles.link} ${
            pathname === "/userspage" ? styles.active : ""
          }`}
        >
          <Link href="/userspage">
            <FaUsers />
          </Link>
        </li>
        <li
          className={`${styles.link} ${
            pathname === "/downloadpage" ? styles.active : ""
          }`}
        >
          <Link href="/downloadpage">
            <FaCloudDownloadAlt />
          </Link>
        </li>
        <li
          className={`${styles.link} ${
            pathname === "/uploadpage" ? styles.active : ""
          }`}
        >
          <Link href="/uploadpage">
            <FaCloudUploadAlt />
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavbarBottom;
