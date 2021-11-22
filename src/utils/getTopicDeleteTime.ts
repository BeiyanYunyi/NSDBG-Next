const getTopicDeleteTime = (content: string) => {
  if (/呃...你想要的东西不在这儿/.test(content))
    return Math.floor(Date.now() / 1000);
  if (/呃... 这是一个非公开的讨论/.test(content))
    return Math.floor(Date.now() / 1000);
  return null;
};

export default getTopicDeleteTime;
