import prompts from "prompts";

import config, { cfgInstance } from "../instances/config";
import numberValidate from "../utils/numberValidate";

const groupMsgValidate = (inputStr: string) => {
  if (inputStr.split("?").length !== 1) {
    return "格式不正确，请确定已经把问号和后面的东西都删掉了";
  }
  return true;
};

/** 用于交互式地调整设置，当然，一个合格的开发者应该具备直接更改 json
 * 甚至源代码的能力，可惜这个项目并不完全是设计给开发者使用的。
 */
const setConfig = async () => {
  const { groupURL }: { groupURL: string } = await prompts({
    message: "输入小组链接，注意把问号和后面的东西都删掉（如果有的话）",
    type: "text",
    name: "groupURL",
    initial: config.groupURL,
    validate: groupMsgValidate,
  });
  const { delay } = await prompts({
    message: "输入每次请求后等待的毫秒数，默认值是比较安全的，越大越安全",
    type: "text",
    name: "delay",
    initial: `${config.delay}`,
    validate: numberValidate,
  });
  const { limit } = await prompts({
    message: "每次运行最多请求多少次？默认值是比较安全的，越小越安全",
    type: "text",
    name: "limit",
    initial: `${config.fetchLimit}`,
    validate: numberValidate,
  });
  cfgInstance.setConfig({
    groupURL,
    delay: Number(delay),
    fetchLimit: Number(limit),
  });
};

export default setConfig;
