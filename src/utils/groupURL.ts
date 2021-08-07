import path from "path/posix";

import config from "../config/config";

export default path.join(config.groupURL, "discussion").replace(":/", "://");
