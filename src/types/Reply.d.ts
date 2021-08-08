export default interface Reply {
  replyID: number;
  topicID: number;
  authorID: string;
  authorName: string;
  isPoster: boolean;
  replyTime: number;
  quoting: boolean;
  quotingImage: string | null;
  quotingText: string | null;
  quotingAuthorID: string | null;
  quotingAuthorName: string | null;
  image: string | null;
  content: string;
}
