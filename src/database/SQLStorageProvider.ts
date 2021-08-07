import StorageProvider from "../types/StorageProvider";
import Topic from "../types/topic";

export default class SQLStorageProvider implements StorageProvider {
  connect(): Promise<unknown> {
    throw new Error("Method not implemented.");
  }
  insertOrReplaceTopicInfo(topics: Topic): Promise<unknown> {
    throw new Error("Method not implemented.");
  }
}
