import path from "path";

import { knex, Knex } from "knex";

import config from "../instances/config";
import Reply from "../types/Reply";
import StorageProvider from "../types/StorageProvider";
import Topic from "../types/Topic";
import logger from "../utils/logger";
import pathUtils from "../utils/pathUtils";

export default class SQLStorageProvider implements StorageProvider {
  db: Knex;
  constructor() {
    this.db = knex({
      client: "sqlite3",
      connection: {
        filename: path.join(
          pathUtils.dataPath,
          `data-${config.groupURL.substring(29).replace("/", "")}.db`
        ),
      },
      useNullAsDefault: true,
    });
  }

  private async createTable() {
    const existTopicList = await this.db.schema.hasTable("topicList");
    if (!existTopicList)
      await this.db.schema.createTable("topicList", (table) => {
        table.string("title");
        table.string("authorID");
        table.string("authorName");
        table.integer("reply").unsigned();
        table.bigInteger("lastReplyTime").nullable().unsigned().index();
        table.bigInteger("topicID").primary().unsigned();
        table.boolean("isElite");
        table.text("content").nullable();
        table.bigInteger("lastFetchTime").nullable();
      });
    const existReplyTable = await this.db.schema.hasTable("reply");
    if (!existReplyTable)
      await this.db.schema.createTable("reply", (table) => {
        table.bigInteger("replyID").primary().unsigned();
        table.bigInteger("topicID").unsigned();
        table.string("authorID");
        table.string("authorName");
        table.boolean("isPoster");
        table.bigInteger("replyTime").unsigned().index();
        table.boolean("quoting");
        table.text("quotingImage").nullable();
        table.text("quotingText").nullable();
        table.string("quotingAuthorID").nullable();
        table.string("quotingAuthorName").nullable();
        table.text("image").nullable();
        table.text("content");
        table.foreign("topicID").references("topicList.topicID");
      });
  }

  connect(): Promise<unknown> {
    return Promise.resolve();
  }

  async queryTopicInfo(topicID: string | number): Promise<Topic | null> {
    try {
      const topicAry = await this.db<Topic>("topicList")
        .where("topicID", "=", Number(topicID))
        .select("*");
      return topicAry.length !== 0 ? topicAry[0] : null;
    } catch (e) {
      logger.error(e);
      return null;
    }
  }

  async insertOrReplaceTopicInfo(topics: Topic[]): Promise<unknown> {
    try {
      await this.createTable();
      await this.db<Topic>("topicList")
        .insert(topics)
        .onConflict("topicID")
        .merge([
          "authorID",
          "authorName",
          "isElite",
          "lastReplyTime",
          "reply",
          "title",
        ]);
    } catch (e) {
      logger.error(e);
    }
    return null;
  }

  async updateTopicInfo(
    topicID: string | number,
    topicPart: Partial<Topic>
  ): Promise<unknown> {
    try {
      await this.db<Topic>("topicList")
        .where("topicID", "=", Number(topicID))
        .update(topicPart);
    } catch (e) {
      logger.error(e);
    }
    return null;
  }

  async getLatestTopicTime() {
    try {
      await this.createTable();
      const topicAry = await this.db<Topic>("topicList")
        .orderBy("lastReplyTime", "desc")
        .select("lastReplyTime")
        .limit(1);
      return topicAry.length !== 0 ? topicAry[0].lastReplyTime : null;
    } catch (e) {
      logger.error(e);
      return null;
    }
  }

  async getAllTopicID() {
    try {
      const topicID = await this.db<Topic>("topicList").select("topicID");
      if (topicID.length === 0) return null;
      return topicID.map((obj) => obj.topicID);
    } catch (e) {
      logger.log(e);
      return null;
    }
  }

  async getTopicIDForUpdate(old = false) {
    try {
      if (old) {
        const topicID = await this.db<Topic>("topicList")
          .whereNull("lastReplyTime")
          .whereNull("lastFetchTime")
          .select("topicID")
          .orderBy("isElite", "desc") // 优先爬精品
          .orderBy("topicID", "desc") // 优先爬新帖
          .limit(config.fetchLimit);
        return topicID.map((obj) => obj.topicID);
      } else {
        const topicID = await this.db<Topic>("topicList")
          .whereRaw("lastFetchTime < lastReplyTime")
          .orWhereNull("lastFetchTime")
          .orWhereNull("content")
          .select("topicID")
          .orderBy("isElite", "desc") // 优先爬精品
          .orderBy("topicID", "desc") // 优先爬新帖
          .limit(config.fetchLimit);
        return topicID.map((obj) => obj.topicID);
      }
    } catch (e) {
      logger.log(e);
      return [];
    }
  }

  async insertOrReplaceReplies(replies: Reply[]) {
    try {
      await this.createTable();
      return await this.db<Reply>("reply")
        .insert(replies)
        .onConflict("replyID")
        .ignore();
    } catch (e) {
      logger.error(e);
      return null;
    }
  }

  async updateReply(replyID: string | number, replyPart: Partial<Reply>) {
    try {
      return await this.db<Reply>("reply")
        .where("replyID", "=", replyID)
        .update(replyPart);
    } catch (e) {
      logger.error(e);
      return null;
    }
  }

  async queryReplyOfTopic(topicID: string | number) {
    try {
      return await this.db<Reply>("reply")
        .where("topicID", "=", Number(topicID))
        .select("*");
    } catch (e) {
      logger.error(e);
      return [];
    }
  }

  async queryAReply(replyID: string | number) {
    try {
      const replyAry = await this.db<Reply>("reply")
        .where("reply", "=", Number(replyID))
        .select("*");
      return replyAry ? replyAry[0] : null;
    } catch (e) {
      logger.error(e);
      return null;
    }
  }
}
