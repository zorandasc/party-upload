export default function CustomDeleteToast({ handleClick }) {
  return (
    <div
      style={{
        marginTop: "2rem",
        padding: "1rem",
        borderRadius: "30px 30px 0 0",
        background: "rgba(255, 255, 255, 0.34)",
        backdropFilter: "blur(7.1px)",

        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.91)",
      }}
    >
      <b>Slike označene za brisanje</b>
      <div style={{ marginTop: "0.5rem" }}>
        <button
          onClick={handleClick}
          style={{
            backgroundColor: "tomato",
            color: "#fff",
            padding: "0.5rem 1rem",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: "0.5rem",
          }}
        >
          Potvrdi brisanje
        </button>
      </div>
    </div>
  );
}
