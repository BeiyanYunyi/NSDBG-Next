import path from "path/posix";

import config from "../instances/config";

export default path.join(config.groupURL, "discussion").replace(":/", "://");
