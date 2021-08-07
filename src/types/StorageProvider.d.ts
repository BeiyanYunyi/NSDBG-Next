import Topic from "./topic";

export default class StorageProvider {
  connect(): Promise<unknown>;
  insertOrReplaceTopicInfo(topics: Topic): Promise<unknown>;
}
