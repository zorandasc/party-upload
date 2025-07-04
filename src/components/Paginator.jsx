import styles from "./paginator.module.css";
import { FaAngleDoubleRight, FaAngleDoubleLeft } from "react-icons/fa";

export default function Paginatior({
  loading,
  page,
  totalPages,
  totalCount,
  hasMore,
  handleLeftClick,
  handleRightClick,
}) {
  return (
    <div className={styles.paginationControls}>
      <button
        className={styles.paginationButton}
        onClick={handleLeftClick}
        disabled={page === 0 || loading}
      >
        <FaAngleDoubleLeft />
      </button>
      <span>
        Stranica {page + 1} / {totalPages}
      </span>
      <span className={styles.total}>{totalCount}</span>
      <button
        className={styles.paginationButton}
        onClick={handleRightClick}
        disabled={!hasMore || loading || page + 1 >= totalPages}
      >
        <FaAngleDoubleRight />
      </button>
    </div>
  );
}
