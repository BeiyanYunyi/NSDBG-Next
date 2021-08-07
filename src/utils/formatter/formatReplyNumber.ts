const formatReplyNumber = (reply: string) => {
  if (reply) {
    return Number(reply);
  }
  return 0;
};

export default formatReplyNumber;
