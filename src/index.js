const dotenv = require('dotenv');
dotenv.config('../env');

const mysql = require('mysql');
const db = require('./config/db');

const { loginAndGetRemainPower } = require('./website');

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc)
dayjs.extend(timezone)

const limit = process.env.LIMIT;
let remain_power = -1;

const testDB = () => {
  const connection = mysql.createConnection(db.mysql);
  connection.connect(function (err) {
    if (err) console.log('error when connecting to db:', err);
    else console.log('Connected to MySQL');
  });
  connection.end();
};

testDB();

const getRemainPower = async (type, groupID, isSlient) => {
  const connection = mysql.createConnection(db.mysql);
  connection.connect((err) => {
    if (err) console.log('error when connecting to db:', err);
  });
  if (type === 'update') {
    if (!isSlient) {
      const msg = '正在更新电费信息，预计一分钟内返回结果...';
      postMessageToQQGroup(msg, groupID);
    }
    const remainPower = await loginAndGetRemainPower();
    if (remainPower === -1) {
      if (!isSlient) {
        const msg = '暂时不能更新数据，请稍后再试';
        postMessageToQQGroup(msg, groupID);
      }
      connection.destroy();
      return;
    }
    const date = new Date().toISOString();
    const params = { remain_power: Number(remainPower).toFixed(2), date: date };
    remain_power = Number(remainPower).toFixed(2);
    connection.query('insert into elec_record set ?', params, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Inserted successfully, current remain power is ${remainPower}`);
        if (!isSlient) {
          const msg = `电费数据更新成功，剩余电费${remainPower}度，更新时间${dayjs().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')}`;
          postMessageToQQGroup(msg, groupID);
        }
      }
      connection.destroy();
    })
  } else if (type === 'query') {
    connection.query('select * from elec_record where id=(select max(id) from elec_record)', (err, res) => {
      if (err) {
        console.log(err);
      } else {
        const result = JSON.parse(JSON.stringify(res))[0];
        remain_power = result.remain_power;
        const queryTime = result.date;
        const res_time = dayjs(queryTime).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');
        const msg = `剩余电费${remain_power.toFixed(2)}度，数据更新时间${res_time}`;
        postMessageToQQGroup(msg, groupID);
      }
      connection.destroy();
    })
  }
};

const schedule = require('node-schedule');
const scheduleCronstyle = () => {
  schedule.scheduleJob('0 0 2 * * *', async () => {
    console.log('轮询周期到--10:00');
    await getRemainPower('update', process.env.GROUPID, true);
    checkLimit(remain_power, process.env.GROUPID);
  });
  schedule.scheduleJob('0 0 14 * * *', async () => {
    console.log('轮询周期到--22:00');
    await getRemainPower('update', process.env.GROUPID, true);
    checkLimit(remain_power, process.env.GROUPID);
  });
}
scheduleCronstyle();

const { createClient } = require("oicq");
const account = process.env.SLAVEID;
const client = createClient(account);

client.on("system.online", () => console.log("Logged in!"));

// client.on("system.login.slider", function (e) {
//   console.log("输入ticket：");
//   process.stdin.once("data", ticket => this.submitSlider(String(ticket).trim()));
// }).login(process.env.SLAVEPWD);

client.on("system.login.qrcode", function (e) {
  //扫码后按回车登录
  process.stdin.once("data", () => {
    this.login()
  })
}).login()

client.on('message.group', async (msg) => {
  if (msg.raw_message === '#电费') {
    await getRemainPower('query', msg.group_id, false);
  } else if (msg.raw_message === '#帮助') {
    msg.reply('输入#电费 查询剩余电费，输入#帮助 查看帮助，输入#更新电费 更新电费数据，电表数据每中午11点与晚上11点更新一次，会在不足20度时自动提醒');
  } else if (msg.raw_message === '#更新电费') {
    await getRemainPower('update', msg.group_id, false);
  } else if (msg.raw_message?.[0] === '#') {
    msg.reply('不知道在问什么，换个问题试试');
  }
})

const checkLimit = (remain_power, group_id) => {
  if (remain_power <= Number(limit) && remain_power !== -1) {
    client.pickGroup(group_id).sendMsg(`剩余电费${remain_power}度，已不足${limit}度，请及时充电`);
  }
}

const postMessageToQQGroup = (msg, groupId) =>
  client.pickGroup(groupId).sendMsg(msg);

