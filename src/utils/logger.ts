const log = (...args: unknown[]) => {
  console.log("\n" + args);
};

const error = (...args: Error[] | string[]) => {
  if (typeof args[0] === "string") {
    console.error("\n" + args);
  } else {
    console.error("\n" + args[0].stack);
  }
};

export default { log, error };
