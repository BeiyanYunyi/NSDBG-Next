import Topic from "./topic";

export default class StorageProvider {
  connect(): Promise<unknown>;
  insertOrReplaceTopicInfo(topics: Topic[]): Promise<unknown>;
  updateTopicInfo(topicID: string, topicPart: Partial<Topic>): Promise<unknown>;
  queryTopicInfo(topicID: string): Promise<Topic | null>;
}
