import config from "../config/config";

const wait = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const basicWait = async () => {
  const delay = (Math.random() + 0.5) * config.delay;
  console.log(`等个${Math.floor(delay)}毫秒`);
  return await wait(delay);
};

export default wait;
