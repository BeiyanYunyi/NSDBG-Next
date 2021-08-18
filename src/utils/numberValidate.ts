/** prompt 的 validator 函数，若合法则返回
 *  true，否则返回错误提示文字
 */
const numberValidate = (inputStr: string) => {
  if (/^\d+$/.test(inputStr)) {
    return true;
  }
  return "格式不正确，请确保输入的是数字";
};

export default numberValidate;
