// Event Paradox v0.4 Output: run last. A console response owns the entire cycle;
// forced scenes reuse the event pipeline and Retry never reapplies their effects.
// Captured console requests also work with blank/null/undefined/"stop" model text.
// Card sidecars are processed separately; only normal prose enters story logic.
const modifier = (text) => {
  return { text: EP_output(text) };
};
modifier(text);
