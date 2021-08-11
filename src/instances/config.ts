import fs from "fs";
import path from "path";

import pathUtils from "../utils/pathUtils";

interface ConfigObj {
  groupURL: string;
  delay: number;
  fetchLimit: number;
}

class Config {
  config: ConfigObj;

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

  saveConfig() {
    fs.writeFileSync(
      path.join(pathUtils.dataPath, "config.json"),
      JSON.stringify(this.config, null, 2)
    );
  }

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

  setConfig(configObj: ConfigObj) {
    this.config = configObj;
  }
}

export const cfgInstance = new Config();
const config = cfgInstance.config;

export default config;
