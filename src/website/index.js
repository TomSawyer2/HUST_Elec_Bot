const puppeteer = require("puppeteer");
const axios = require("axios");
const { recognize } = require("./recognize");
const dotenv = require('dotenv');
dotenv.config('../../env');

const getCode = async (cookies) => {
  const { data: codeGifBuffer } = await axios.get(
    `https://pass.hust.edu.cn/cas/code?${Math.random()}`,
    {
      responseType: "arraybuffer",
      headers: {
        Cookie: parseCks(cookies),
      },
    }
  );
  const code = await recognize(codeGifBuffer);
  return code;
};

const parseCks = (cookies) => {
  return cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
};

const loginAndGetRemainPower = async () => {
  let cookies = [];

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.goto(process.env.QUERY_URL);

  await page.setDefaultNavigationTimeout(60000);

  try {
    cookies = await page.cookies();

    const usernameInput = await page.$("#un");
    await usernameInput?.type(process.env.HUST_USERNAME);

    const passwordInput = await page.$("#pd");
    await passwordInput?.type(process.env.HUST_PASSWORD);

    let code = '';
    while (code.length !== 4) {
      code = await getCode(cookies);
    }
    const codeInput = await page.$("#code");
    await codeInput?.type(code);

    const loginBtn = await page.$("#index_login_btn");
    await loginBtn?.click();

    await page.waitForNavigation({
      waitUntil: "networkidle0",
    });

    const roomInfo = {
      roomId: process.env.ROOM_ID,
      roomName: process.env.ROOM_NAME,
      areaName: process.env.AREA_NAME,
      dormitoryName: process.env.DORMITORY_NAME
    };
    const roomInfoStr = JSON.stringify(roomInfo);
    const userId = process.env.HUST_USERNAME;

    await page.evaluate((roomInfoStr, userId) => {
      localStorage.setItem("user", roomInfoStr);
      localStorage.setItem("userId", userId);
    }, roomInfoStr, userId);

    // 刷新页面
    await page.reload({
      waitUntil: "networkidle0",
    });
    
    const p = await page.$(".AmValue");
    const text = await page.evaluate((p) => p?.innerText, p);

    await browser.close();

    return text;
  } catch (err) {
    console.error(err);
    return -1;
  }
};

module.exports = { loginAndGetRemainPower };
