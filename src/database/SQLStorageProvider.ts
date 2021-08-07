import { knex, Knex } from "knex";

import StorageProvider from "../types/StorageProvider";
import Topic from "../types/topic";

export default class SQLStorageProvider implements StorageProvider {
  db: Knex;
  constructor() {
    this.db = knex({
      client: "sqlite3",
      connection: { filename: "./data/data.db" },
      useNullAsDefault: true,
    });
  }

  private async createTable() {
    const existance = await this.db.schema.hasTable("topicList");
    if (!existance)
      await this.db.schema.createTable("topicList", (table) => {
        table.string("title");
        table.string("authorID");
        table.string("authorName");
        table.integer("reply").unsigned();
        table.bigInteger("lastReplyTime").nullable().unsigned();
        table.bigInteger("topicID").primary().unsigned();
      });
  }

  connect(): Promise<unknown> {
    return Promise.resolve();
  }

  async queryTopicInfo(topicID: string): Promise<Topic | null> {
    try {
      const topicAry = await this.db<Topic>("topicList")
        .where("topicID", topicID)
        .select("*");
      return topicAry ? topicAry[0] : null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async insertOrReplaceTopicInfo(topics: Topic[]): Promise<unknown> {
    try {
      await this.createTable();
      await this.db<Topic>("topicList")
        .insert(topics)
        .onConflict("topicID")
        .merge();
    } catch (e) {
      console.error(e);
    }
    return null;
  }

  async updateTopicInfo(
    topicID: string,
    topicPart: Partial<Topic>
  ): Promise<unknown> {
    try {
      await this.db<Topic>("topicList").update({
        topicID: Number(topicID),
        ...topicPart,
      });
    } catch (e) {
      console.error(e);
    }
    return null;
  }
}
