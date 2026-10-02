// Event Paradox v0.4 Context: run last. Console cycles receive only a neutral
// control prompt; ordinary cycles keep bounded memory and remove known controls.
// Opt-in Auto-Cards may add one bounded card task beside normal generation.
const modifier = (text) => {
  return { text: EP_context(text) };
};
modifier(text);
