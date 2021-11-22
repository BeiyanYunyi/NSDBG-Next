const log = (...args: unknown[]) => {
  console.log("\n" + args);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const error = (...args: any[]) => {
  if (typeof args[0] === "string") {
    console.error("\n" + args);
  } else {
    console.error("\n" + args[0].stack);
  }
};

export default { log, error };
