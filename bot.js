const { Telegraf } = require('telegraf');
const { exec } = require('child_process');
const fs = require('fs');

const BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';
const OWNER_ID = 7671519475;

const bot = new Telegraf(BOT_TOKEN);

// --- SETTINGS ---
const s = { welcome: null, goodbye: null, warnLimit: 3, warns: {}, antiLink: false, antiImage: false, antiVideo: false, antiSticker: false, antiAudio: false, antiMention: false, antiGroupLink: false, onlyAdmins: false };
let groupRules = {};
let masterMode = false;
let autoReplyEnabled = true;

// --- AUTO-REPLY ---
const replies = ["Hey! 😊 Thanks for reaching out!", "Hi there! 👋 Give me a sec!", "Hello! 🌟 Thanks for texting!", "Hey! 💬 Got your message!", "Hi! ✨ Thanks for reaching out!", "Hello! 😄 Let me process that!", "Hey there! 👋 I'll get back to you!", "Hi! 🌈 Thanks for your patience!", "Hello! 🎯 I'm on it!", "Hey! 💫 Got it!"];

function getReply() { return replies[Math.floor(Math.random() * replies.length)]; }

// --- OWNER CHECK ---
bot.use(async (ctx, next) => {
    if (!ctx.message || !ctx.message.text || !ctx.message.text.startsWith('/')) return next();
    const isOwner = ctx.from.id === OWNER_ID;
    const ownerCmds = ['/myid', '/restart', '/stats', '/clearcache', '/calc', '/update'];
    if (ownerCmds.includes(ctx.message.text.split(' ')[0].toLowerCase())) {
        if (!isOwner) return;
        return next();
    }
    if (ctx.chat.type === 'private') return next();
    if (!masterMode) return next();
    if (!isOwner) return ctx.reply('❌ Only bot owner can use commands here.');
    return next();
});

// --- OWNER COMMANDS ---
bot.command('clearcache', async (ctx) => {
    if (ctx.from.id !== OWNER_ID) return;
    const msg = await ctx.reply('🧹 Clearing cache and restarting...');
    exec('npm cache clean --force 2>/dev/null; rm -rf /tmp/* 2>/dev/null; pm2 flush 2>/dev/null', () => {
        ctx.editMessageText('✅ Cache cleared! Restarting bot...');
        setTimeout(() => process.exit(0), 2000);
    });
});

bot.command('restart', async (ctx) => {
    if (ctx.from.id !== OWNER_ID) return;
    await ctx.reply('🔄 Restarting bot...');
    setTimeout(() => process.exit(0), 1500);
});

// --- AUTO-UPDATE (Updates bot.js AND commands.js from GitHub) ---
bot.command('update', async (ctx) => {
    if (ctx.from.id !== OWNER_ID) return;
    
    const msg = await ctx.reply('🔄 **Checking for updates...**');
    
    try {
        const repoBase = 'https://raw.githubusercontent.com/Crownex03/ADE-TECHULTRA_bot/main/';
        const files = ['bot.js', 'commands.js'];
        let updated = 0;
        let updateMsg = '';
        let failed = false;
        
        for (const file of files) {
            try {
                const response = await fetch(`${repoBase}${file}`);
                if (!response.ok) {
                    updateMsg += `❌ Failed to fetch ${file}\n`;
                    failed = true;
                    continue;
                }
                
                const newContent = await response.text();
                const currentPath = `./${file}`;
                
                if (fs.existsSync(currentPath)) {
                    const currentContent = fs.readFileSync(currentPath, 'utf8');
                    if (currentContent !== newContent) {
                        fs.writeFileSync(`${file}.backup`, currentContent);
                        fs.writeFileSync(currentPath, newContent);
                        updated++;
                        updateMsg += `✅ Updated ${file}\n`;
                    } else {
                        updateMsg += `⏭️ ${file} is already up to date\n`;
                    }
                } else {
                    fs.writeFileSync(currentPath, newContent);
                    updated++;
                    updateMsg += `✅ Created ${file}\n`;
                }
            } catch (fileError) {
                updateMsg += `❌ Error updating ${file}: ${fileError.message}\n`;
                failed = true;
            }
        }
        
        if (updated === 0 && !failed) {
            return ctx.editMessageText('✅ **Bot is already up to date!**\n\nNo changes found.');
        }
        
        await ctx.editMessageText(
            `✅ **Update completed!**\n\n` +
            `${updateMsg}\n` +
            `🔄 Restarting bot to apply changes...`
        );
        
        setTimeout(() => {
            process.exit(0);
        }, 2000);
        
    } catch (error) {
        console.error('Update error:', error);
        ctx.editMessageText(`❌ **Update failed:**\n\`${error.message}\``);
    }
});

bot.command('calc', async (ctx) => {
    if (ctx.from.id !== OWNER_ID) return;
    const e = ctx.message.text.replace('/calc', '').trim();
    if (!e) return ctx.reply('🧮 Usage: /calc 2+2');
    try {
        const r = Function(`"use strict"; return (${e.replace(/[^0-9+\-*/().\s]/g,'')})`)();
        ctx.reply(`🧮 **Result:** \`${r}\``);
    } catch { ctx.reply('❌ Invalid'); }
});

bot.command('myid', async (ctx) => {
    if (ctx.from.id !== OWNER_ID) return;
    ctx.reply(`🔒 Your ID: ${ctx.from.id}\n✅ Match: ${ctx.from.id === OWNER_ID ? 'YES' : 'NO'}`);
});

bot.command('stats', async (ctx) => {
    if (ctx.from.id !== OWNER_ID) return;
    const u = process.uptime();
    ctx.reply(`⏱️ ${Math.floor(u/3600)}h ${Math.floor((u%3600)/60)}m`);
});

// --- AUTO-REPLY ---
bot.on('text', async (ctx) => {
    if (ctx.chat.type !== 'private' || !autoReplyEnabled || ctx.from.id === OWNER_ID) return;
    if (ctx.message.text && ctx.message.text.startsWith('/')) return;
    try {
        await new Promise(r => setTimeout(r, 1500));
        await ctx.sendChatAction('typing');
        await new Promise(r => setTimeout(r, 1000));
        await ctx.reply(getReply());
    } catch (e) {}
});

bot.command('autoreply', async (ctx) => {
    if (ctx.from.id !== OWNER_ID) return;
    const m = ctx.message.text.split(' ')[1]?.toLowerCase();
    if (m === 'on') { autoReplyEnabled = true; ctx.reply('✅ ON'); }
    else if (m === 'off') { autoReplyEnabled = false; ctx.reply('❌ OFF'); }
    else { ctx.reply('❌ /autoreply on/off'); }
});

bot.command('mastermode', async (ctx) => {
    if (ctx.from.id !== OWNER_ID) return;
    const m = ctx.message.text.split(' ')[1]?.toLowerCase();
    if (m === 'on') { masterMode = true; ctx.reply('🔒 ON'); }
    else if (m === 'off') { masterMode = false; ctx.reply('🔓 OFF'); }
    else { ctx.reply('❌ /mastermode on/off'); }
});

// --- GAMES ---
const truths = ["What's your biggest fear?", "Have you ever lied to your best friend?", "What's the most embarrassing thing you've done?", "Who is your secret crush?", "What's the worst date you've ever been on?", "Have you ever cheated on a test?", "What's the most money you've ever found?", "What's your biggest regret?"];
const dares = ["Do 10 push-ups!", "Sing your favorite song!", "Send a random emoji to the last person you texted!", "Talk in a British accent!", "Post something embarrassing on your status!", "Do a funny dance!", "Call a friend and sing Happy Birthday!", "Send a selfie with a funny face!"];
const riddles = [{ q: "What has keys but no locks?", a: "Keyboard" }, { q: "What has a head and a tail but no body?", a: "Coin" }, { q: "What gets wetter the more it dries?", a: "Towel" }, { q: "What has to be broken before you can use it?", a: "Egg" }, { q: "What goes up but never comes down?", a: "Age" }, { q: "What has cities but no houses?", a: "Map" }];
let riddleAns = {};

bot.start((ctx) => ctx.reply('🤖 Bot running! /help'));
bot.command('ping', async (ctx) => {
    const start = Date.now();
    const msg = await ctx.reply('⏳...');
    ctx.editMessageText(`🏓 Pong! ${Date.now()-start}ms`);
});
bot.command('help', (ctx) => ctx.reply(`📋 Commands:
🎮 /truth, /dare, /riddle, /answer
🔹 /kick, /promote, /demote, /ban, /unban
⚠️ /warn, /resetwarn, /setwarn, /warnings
🔇 /mute, /unmute
⚙️ /welcome, /goodbye, /onlyadmins, /leave
📊 /groupinfo, /grouplink, /tagall, /setdesc, /disp, /stats
🛡️ /antilink, /antiimage, /antivideo, /antisticker, /antiaudio, /antimention, /antigrouplink
📩 /feedback, /setrules, /rules, /broadcast
🤖 /autoreply on/off
🔒 /mastermode on/off
🔄 /update (Owner only)`));

bot.command('truth', (ctx) => ctx.reply(`💬 ${truths[Math.floor(Math.random()*truths.length)]}`));
bot.command('dare', (ctx) => ctx.reply(`🔥 ${dares[Math.floor(Math.random()*dares.length)]}`));
bot.command('riddle', (ctx) => {
    const r = riddles[Math.floor(Math.random()*riddles.length)];
    riddleAns[ctx.from.id] = r.a;
    ctx.reply(`🧩 ${r.q}\n\n💡 /answer`);
});
bot.command('answer', (ctx) => {
    if (!riddleAns[ctx.from.id]) return ctx.reply('❌ No riddle.');
    ctx.reply(`💡 ${riddleAns[ctx.from.id]}`);
    delete riddleAns[ctx.from.id];
});

// --- HELPERS ---
async function isAdmin(ctx, uid) {
    try { const m = await ctx.getChatMember(uid); return ['administrator', 'creator'].includes(m.status); } catch { return false; }
}
async function isBotAdmin(ctx) {
    try { const m = await ctx.getChatMember(ctx.botInfo.id); return ['administrator', 'creator'].includes(m.status); } catch { return false; }
}

// --- FEEDBACK ---
bot.command('feedback', async (ctx) => {
    const msg = ctx.message.text.replace('/feedback', '').trim();
    if (!msg) return ctx.reply('❌ Usage: /feedback <message>');
    try { await bot.telegram.sendMessage(OWNER_ID, `📩 ${ctx.from.first_name}: ${msg}`); ctx.reply('✅ Thank you!'); } catch { ctx.reply('❌ Failed.'); }
});

// --- BROADCAST ---
bot.command('broadcast', async (ctx) => {
    if (!await isAdmin(ctx, ctx.from.id)) return ctx.reply('❌ Admins only!');
    const msg = ctx.message.text.replace('/broadcast', '').trim();
    if (!msg) return ctx.reply('❌ Usage: /broadcast <message>');
    try {
        const admins = await ctx.getChatAdministrators();
        let sent = 0;
        for (const a of admins) {
            try { await bot.telegram.sendMessage(a.user.id, `📢 ${msg}`); sent++; } catch (e) {}
        }
        ctx.reply(`✅ Broadcast sent to ${sent} members!`);
    } catch { ctx.reply('❌ Failed.'); }
});

// --- RULES ---
bot.command('setrules', async (ctx) => {
    if (!await isAdmin(ctx, ctx.from.id)) return ctx.reply('❌ Admins only!');
    const rules = ctx.message.text.replace('/setrules', '').trim();
    if (!rules) return ctx.reply('❌ Usage: /setrules <rules>');
    groupRules[ctx.chat.id] = rules;
    ctx.reply('✅ Rules set! Use /rules');
});
bot.command('rules', async (ctx) => {
    const rules = groupRules[ctx.chat.id];
    if (!rules) return ctx.reply('📋 No rules set.');
    ctx.reply(`📋 RULES\n\n${rules}`);
});

// --- IMPORT COMMANDS FROM commands.js ---
require('./commands')(bot, s, groupRules, masterMode, autoReplyEnabled, isAdmin, isBotAdmin, OWNER_ID);

// --- WELCOME/GREET ---
bot.on('new_chat_members', async (ctx) => {
    if (s.welcome) {
        const member = ctx.message.new_chat_members[0];
        const name = member.first_name;
        const userId = member.id;
        ctx.reply(s.welcome.replace(/{name}/g, name).replace(/{user_id}/g, userId), { parse_mode: 'Markdown' });
    }
});
bot.on('left_chat_member', async (ctx) => {
    if (s.goodbye) {
        const member = ctx.message.left_chat_member;
        const name = member.first_name;
        const userId = member.id;
        ctx.reply(s.goodbye.replace(/{name}/g, name).replace(/{user_id}/g, userId), { parse_mode: 'Markdown' });
    }
});

// --- START ---
bot.launch();
console.log('✅ Bot running!');
console.log('🎮 Games: /truth, /dare, /riddle');
console.log('🔄 Auto-Update: /update');
console.log(`👑 Owner: ${OWNER_ID}`);
console.log('🛡️ Owner messages are NEVER deleted!');

process.on('SIGINT', () => bot.stop());
process.on('SIGTERM', () => bot.stop());
