import config from "../instances/config";

const wait = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const basicWait = async () => {
  const delay = (Math.random() + 0.5) * config.delay;
  return await wait(delay);
};

export default wait;
