const log = (...args: unknown[]) => {
  console.log("\n" + args);
};

const error = (...args: unknown[]) => {
  console.error("\n" + args);
};

export default { log, error };
