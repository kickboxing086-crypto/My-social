const text = "Check out https://google.com and www.test.com";
const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
console.log(text.split(urlRegex));
