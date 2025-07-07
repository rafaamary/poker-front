function HiddenCard() {
  return (
    <img
      src="/cards/back.svg"
      alt="Carta virada"
      style={{
        width: 60,
        height: 90,
        objectFit: "cover",
        borderRadius: 4,
        margin: "0 5px",
        filter: "grayscale(50%)",
      }}
    />
  );
}
