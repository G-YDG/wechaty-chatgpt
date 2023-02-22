import {WechatyBuilder} from 'wechaty';
import {ChatGPTAPI} from 'chatgpt';

let apiKey = '';
const gptApi = new ChatGPTAPI({apiKey: apiKey || process.env.OPENAI_API_KEY});

const conversationPool = new Map();

const wechatBot = WechatyBuilder.build({
    name: 'wechaty-chatgpt',
    puppet: 'wechaty-puppet-wechat',
    puppetOptions: {
        uos: true,
    },
});

wechatBot
    .on('scan', async (qrcode, status) => {
        console.log(`请打开二维码链接，进行扫码登录: ${status}\nhttps://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`)
    })
    .on('login', async (user) => {
        console.log(`用户<${user.name()}>已成功登录`);
    })
    .on('logout', async (user) => {
        console.log(`用户<${user.name()}>已退出登录`);
    })
    .on('message', async message => {
        const talker = message.talker();
        const listener = message.listener();
        const room = message.room();
        const listenerName = listener.name();
        let content = message.text();

        if (!message.type() === wechatBot.Message.Type.Text) {
            console.log(`消息类型: ${message.type()}, 内容: ${message.text()}`);
            return null;
        }

        if (room) {
            if (await message.mentionSelf()) {
                const groupContent = content.replace(`@${listenerName}`, '');
                if (groupContent) {
                    content = content.trim();
                    if (content.startsWith('/c ')) {
                        await gptReply(room, talker, content.replace('/c ', ''));
                    }
                    if (content.startsWith('/chatgpt ')) {
                        await gptReply(room, talker, content.replace('/chatgpt ', ''));
                    }
                }
            }
        } else {
            if (!talker.self()) {
                await gptReply(null, talker, content);
            }
        }
    });

wechatBot
    .start()
    .then(() => console.log('系统启动中...'))
    .catch(e => console.error(e));

async function gptReply(room, talker, content) {
    let replyContent = '出了一点小问题，请稍后重试下...';
    try {
        let opts = {};
        let conversation = conversationPool.get(talker.id);
        if (conversation) {
            opts = conversation;
        }
        opts.timeoutMs = 2 * 60 * 1000;
        let res = await gptApi.sendMessage(content, opts);
        replyContent = res.text;
        conversation = {
            conversationId: res.conversationId,
            parentMessageId: res.id,
        };
        conversationPool.set(talker.id, conversation);
    } catch (e) {
        if (e.message === 'ChatGPTAPI error 429') {
            replyContent = '请稍等一下哦，我还在思考你的上一个问题';
        }
        console.error(e);
    }

    await printfMessage(room, talker, content, replyContent)
    await send(room || talker, `${content} \n ------------------------ \n` + replyContent);
}

async function send(talker, message) {
    try {
        await talker.say(message);
    } catch (e) {
        console.error(e);
    }
}

async function printfMessage(room, talker, content, replyContent) {
    const talkerName = await talker.name();
    let logContent = `Contact: <${talkerName}>, Content: ${content}`;
    if (replyContent) {
        logContent = logContent + `, ReplyContent: ${replyContent}`;
    }
    if (room) {
        const roomTopic = await room.topic();
        logContent = `RoomName: ${roomTopic}, ` + logContent;
    }
    console.log(logContent);
}