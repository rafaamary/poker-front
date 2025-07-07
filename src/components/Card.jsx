function Card({ value }) {
  if (value === "?") {
    return (
      <img
        src="/cards/back.svg"
        alt="Carta oculta"
        style={cardStyle}
      />
    );
  }

  const cardSrc = `/cards/${value}.svg`; // ex: "3H.png"
  return (
    <img
      src={cardSrc}
      alt={value}
      style={cardStyle}
    />
  );
}

const cardStyle = {
  width: 60,
  height: 90,
  objectFit: "cover",
  borderRadius: 4,
  margin: "0 5px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
  background: "#fff",
};

export default Card;