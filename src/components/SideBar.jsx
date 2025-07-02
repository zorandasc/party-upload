import { FaTrashAlt, FaShareAlt } from "react-icons/fa";
import styles from "./sideBar.module.css";

export default function SideBar({ handleTrash, handleShare, checkboxMode }) {
  return (
    <div className={styles.sidebar}>
      <button
        className={`${styles.link} ${
          checkboxMode === "share" ? styles.active : ""
        }`}
        onClick={handleShare}
      >
        <FaShareAlt></FaShareAlt>
      </button>
      <button
        className={`${styles.link} ${
          checkboxMode === "trash" ? styles.active : ""
        }`}
        onClick={handleTrash}
      >
        <FaTrashAlt></FaTrashAlt>
      </button>
    </div>
  );
}
