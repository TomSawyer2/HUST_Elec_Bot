# HUST_Elec_Bot

## 简介

**电力查询QQ机器人**

基于OICQ协议库搭建的用于华科寝室电力查询、电力欠费通知的QQ机器人

## 部署

在根目录下建立`.env`文件，并在其中配置以下内容：

```env
MASTERID=主人QQ账号
SLAVEID=机器人QQ账号
SLAVEPWD=机器人QQ密码
GROUPID=通知群号
LIMIT=电费欠费标准（单位：度）
HUST_USERNAME=HUB系统账号
HUST_PASSWORD=HUB系统密码
QUERY_URL=电费查询网站的url（需要去除?id=xxx)
```

使用`/src/config`目录下的`elec.sql`文件创建数据库

在`/src/config`目录下建立`db.js`文件，并在其中配置以下内容：

```js
const mysql = {
    host: 'host',
    port: 'port',
    user: 'username',
    password: 'password',
    database: 'databasename'
}
module.exports = { mysql }
```

使用dockerfile构建镜像后直接启动，进入容器先`npm run init`登录机器人账号，再`npm run start`持久化

## 开发

```bash
pnpm i
pnpm dev
```

## 镜像打包

```bash
docker build . -t hust_elec_bot:v1.0
docker run --name hust_elec_bot -itd hust_elec_bot:v1.0
```