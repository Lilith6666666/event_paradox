// Event Paradox v0.4 Input: capture whole-action /ep controls before other
// scripts can interpret them. The returned control placeholder is nonempty.
// Ordinary inputs cancel stale card tasks and rescan existing entity cards.
// Install Library too. Keep only ONE modifier when composing scripts.
const modifier = (text) => {
  return { text: EP_input(text) };
};
modifier(text);
