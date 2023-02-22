# Wechaty + ChatGPT 实现个人聊天机器人

## 介绍
- 使用API调用，无需科学上网
- 使用UOS协议（包括本项目）登录微信有封号风险，请谨慎使用

## 流程

### 注册ChatGPT账号

- 注册地址: <https://chat.openai.com/chat>
- 注册教程: <https://juejin.cn/post/7173447848292253704>

### 获取ChatGPT接口访问密钥

- 创建密钥：https://platform.openai.com/account/api-keys

### 安装

#### 环境要求
- node >= 18.0.0
- npm >= 9.5.0

#### 源码安装

```bash
git clone https://github.com/sunshanpeng/wechaty-chatgpt.git
cd wechaty-chatgpt
```

```bash
export OPENAI_API_KEY=上文所创建的密钥 
npm i
npm run chatgpt
```

## 感谢

- <https://github.com/sunshanpeng/wechaty-chatgpt/>
- <https://github.com/wechaty/wechaty/>
- <https://github.com/transitive-bullshit/chatgpt-api>
