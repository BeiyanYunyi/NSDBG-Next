const numberValidate = (inputStr: string) => {
  if (/^\d+$/.test(inputStr)) {
    return true;
  }
  return "格式不正确，请确保输入的是数字";
};

export default numberValidate;
