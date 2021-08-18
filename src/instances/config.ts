import fs from "fs";
import path from "path";

import pathUtils from "../utils/pathUtils";

interface ConfigObj {
  /** 小组链接，URL 中必须不带任何参数 */
  groupURL: string;
  /** 每次获取间隔 */
  delay: number;
  /** {@link updateTopic} 中最多获取多少个帖子 */
  fetchLimit: number;
}

class Config {
  config: ConfigObj;

  /** 从 config.json 中读取配置，若不存在，则使用默认配置 */
  constructor() {
    try {
      const cfgBuffer = fs.readFileSync(
        path.join(pathUtils.dataPath, "config.json")
      );
      const cfg = JSON.parse(cfgBuffer.toString());
      this.config = cfg;
    } catch (error) {
      this.config = {
        groupURL: "https://www.douban.com/group/114514/",
        delay: 2000,
        fetchLimit: 300,
      };
    }
  }

  /** 用于保存配置信息 */
  saveConfig() {
    fs.writeFileSync(
      path.join(pathUtils.dataPath, "config.json"),
      JSON.stringify(this.config, null, 2)
    );
  }

  /** 判断配置文件是否存在，返回布尔值 */
  configExists() {
    try {
      if (fs.readFileSync(path.join(pathUtils.dataPath, "config.json"))) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /** 用来在运行时更改配置，但好像没什么用的样子 */
  setConfig(configObj: ConfigObj) {
    this.config = configObj;
  }
}

export const cfgInstance = new Config();
const config = cfgInstance.config;

export default config;
