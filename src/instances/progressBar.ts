import cliProgress from "cli-progress";
import { green } from "colors";

const progressBar = new cliProgress.SingleBar({
  format:
    "进度：" +
    green("{bar}") +
    "| {percentage}% || {value}/{total} || 还剩: {eta}s || 当前: {status}",
  barCompleteChar: "█",
  barIncompleteChar: "░",
  hideCursor: true,
});
export default progressBar;
