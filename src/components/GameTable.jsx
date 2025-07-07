function GameTable({ communityCards, pot }) {
  return (
    <div style={styles.table}>
      <div style={styles.pot}>Pot: ${pot.toFixed(2)}</div>
      <div style={styles.cards}>
        {communityCards.map((card, i) => (
          <Card key={i} value={card} />
        ))}
        {Array(5 - communityCards.length).fill(0).map((_, i) => (
          <Card key={`empty-${i}`} value="?" />
        ))}
      </div>
    </div>
  );
}
