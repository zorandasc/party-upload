import styles from "./customDeleteToast.module.css";

export default function CustomDeleteToast({ numberOfImages, handleClick }) {
  return (
    <div className={styles.container}>
      <b>{numberOfImages} slika označene za brisanje</b>
      <div className={styles.buttonContainer}>
        <button onClick={handleClick} className={styles.button}>
          Potvrdi brisanje
        </button>
      </div>
    </div>
  );
}
