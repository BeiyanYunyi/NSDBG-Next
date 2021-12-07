import Reply from "./Reply";
import Topic from "./Topic";

export default class StorageProvider {
  connect(): Promise<unknown>;
  insertOrReplaceTopicInfo(topics: Topic[]): Promise<unknown>;
  updateTopicInfo(
    topicID: string | number,
    topicPart: Partial<Topic>
  ): Promise<unknown>;
  queryTopicInfo(topicID: string | number): Promise<Topic | null>;
  updateReplyCount(topicID: string): Promise<void>;
  getLatestTopicTime(): Promise<number | null>;
  getAllTopicID(): Promise<string[] | null>;
  getTopicIDForUpdate(): Promise<string[]>;
  getTopicIDByTimeRange(
    minTime: number,
    maxTime?: number,
    limit?: number
  ): Promise<string[]>;
  insertOrReplaceReplies(replies: Reply[]): Promise<unknown>;
  updateReply(
    replyID: string | number,
    replyPart: Partial<Reply>
  ): Promise<unknown>;
  queryReplyOfTopic(topicID: string | number): Promise<Reply[]>;
  queryAReply(replyID: string | number): Promise<Reply | null>;
}
