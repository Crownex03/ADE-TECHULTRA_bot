module.exports = (bot, s, groupRules, masterMode, autoReplyEnabled, isAdmin, isBotAdmin, OWNER_ID) => {

// --- ADMIN ---
bot.command('kick', async (ctx) => {
    if (!await isBotAdmin(ctx) || !await isAdmin(ctx, ctx.from.id)) return;
    const r = ctx.message.reply_to_message;
    if (!r) return ctx.reply('❌ Reply to a user!');
    try { await ctx.kickChatMember(r.from.id); ctx.reply(`✅ ${r.from.first_name} kicked!`); } catch { ctx.reply('❌ Failed!'); }
});
bot.command('promote', async (ctx) => {
    if (!await isBotAdmin(ctx) || !await isAdmin(ctx, ctx.from.id)) return;
    const r = ctx.message.reply_to_message;
    if (!r) return ctx.reply('❌ Reply to a user!');
    try { await ctx.promoteChatMember(r.from.id, { can_change_info: true, can_delete_messages: true, can_invite_users: true, can_restrict_members: true, can_pin_messages: true }); ctx.reply(`✅ ${r.from.first_name} promoted!`); } catch { ctx.reply('❌ Failed!'); }
});
bot.command('demote', async (ctx) => {
    if (!await isBotAdmin(ctx) || !await isAdmin(ctx, ctx.from.id)) return;
    const r = ctx.message.reply_to_message;
    if (!r) return ctx.reply('❌ Reply to a user!');
    try { await ctx.promoteChatMember(r.from.id, { can_change_info: false, can_delete_messages: false, can_invite_users: false, can_restrict_members: false, can_pin_messages: false }); ctx.reply(`✅ ${r.from.first_name} demoted!`); } catch { ctx.reply('❌ Failed!'); }
});
bot.command('ban', async (ctx) => {
    if (!await isBotAdmin(ctx) || !await isAdmin(ctx, ctx.from.id)) return;
    const r = ctx.message.reply_to_message;
    if (!r) return ctx.reply('❌ Reply to a user!');
    try { await ctx.banChatMember(r.from.id); ctx.reply(`✅ ${r.from.first_name} banned!`); } catch { ctx.reply('❌ Failed!'); }
});
bot.command('unban', async (ctx) => {
    if (!await isBotAdmin(ctx) || !await isAdmin(ctx, ctx.from.id)) return;
    const args = ctx.message.text.split(' ');
    if (args.length < 2) return ctx.reply('❌ Usage: /unban <user_id>');
    try { await ctx.unbanChatMember(parseInt(args[1])); ctx.reply(`✅ User ${args[1]} unbanned!`); } catch { ctx.reply('❌ Failed!'); }
});

// --- WARNINGS ---
bot.command('warn', async (ctx) => {
    if (!await isAdmin(ctx, ctx.from.id)) return;
    const r = ctx.message.reply_to_message;
    if (!r) return ctx.reply('❌ Reply to a user!');
    const uid = r.from.id;
    if (!s.warns[uid]) s.warns[uid] = 0;
    s.warns[uid]++;
    await ctx.reply(`⚠️ ${r.from.first_name} warned! (${s.warns[uid]}/${s.warnLimit})`);
    if (s.warns[uid] >= s.warnLimit) {
        try { await ctx.restrictChatMember(uid, { can_send_messages: false }); ctx.reply(`🔇 ${r.from.first_name} muted!`); s.warns[uid] = 0; } catch { ctx.reply('❌ Failed to mute!'); }
    }
});
bot.command('resetwarn', async (ctx) => {
    if (!await isAdmin(ctx, ctx.from.id)) return;
    const r = ctx.message.reply_to_message;
    if (!r) return ctx.reply('❌ Reply to a user!');
    s.warns[r.from.id] = 0;
    ctx.reply(`✅ Warnings reset for ${r.from.first_name}`);
});
bot.command('setwarn', async (ctx) => {
    if (!await isAdmin(ctx, ctx.from.id)) return;
    const args = ctx.message.text.split(' ');
    if (args.length < 2) return ctx.reply('❌ Usage: /setwarn <number>');
    const l = parseInt(args[1]);
    if (isNaN(l) || l < 1) return ctx.reply('❌ Enter a valid number!');
    s.warnLimit = l;
    ctx.reply(`✅ Warn limit set to ${l}`);
});
bot.command('warnings', (ctx) => {
    const c = s.warns[ctx.from.id] || 0;
    ctx.reply(`⚠️ Your warnings: ${c}/${s.warnLimit}`);
});

// --- MUTE ---
bot.command('mute', async (ctx) => {
    if (!await isBotAdmin(ctx) || !await isAdmin(ctx, ctx.from.id)) return;
    const r = ctx.message.reply_to_message;
    if (!r) return ctx.reply('❌ Reply to a user!');
    try { await ctx.restrictChatMember(r.from.id, { can_send_messages: false }); ctx.reply(`🔇 ${r.from.first_name} muted!`); } catch { ctx.reply('❌ Failed!'); }
});
bot.command('unmute', async (ctx) => {
    if (!await isBotAdmin(ctx) || !await isAdmin(ctx, ctx.from.id)) return;
    const r = ctx.message.reply_to_message;
    if (!r) return ctx.reply('❌ Reply to a user!');
    try { await ctx.restrictChatMember(r.from.id, { can_send_messages: true }); ctx.reply(`🔊 ${r.from.first_name} unmuted!`); } catch { ctx.reply('❌ Failed!'); }
});

// --- SETTINGS ---
bot.command('welcome', async (ctx) => {
    if (!await isAdmin(ctx, ctx.from.id)) return;
    const t = ctx.message.text.replace('/welcome', '').trim();
    if (!t) return ctx.reply('❌ Usage: /welcome <message>');
    s.welcome = t;
    ctx.reply('✅ Welcome message set!');
});
bot.command('goodbye', async (ctx) => {
    if (!await isAdmin(ctx, ctx.from.id)) return;
    const t = ctx.message.text.replace('/goodbye', '').trim();
    if (!t) return ctx.reply('❌ Usage: /goodbye <message>');
    s.goodbye = t;
    ctx.reply('✅ Goodbye message set!');
});
bot.command('onlyadmins', async (ctx) => {
    if (!await isAdmin(ctx, ctx.from.id)) return;
    const v = ctx.message.text.split(' ')[1]?.toLowerCase();
    if (v === 'on' || v === 'off') { s.onlyAdmins = v === 'on'; ctx.reply(`✅ Admin-only ${v === 'on' ? 'enabled' : 'disabled'}`); } else { ctx.reply(`❌ /onlyadmins on/off\nCurrent: ${s.onlyAdmins ? 'ON' : 'OFF'}`); }
});
bot.command('leave', async (ctx) => {
    if (!await isAdmin(ctx, ctx.from.id)) return;
    await ctx.reply('👋 Goodbye!');
    await ctx.leaveChat();
});

// --- INFO ---
bot.command('groupinfo', async (ctx) => {
    try {
        const chat = await ctx.getChat();
        const admins = await ctx.getChatAdministrators();
        const count = await ctx.getChatMembersCount();
        ctx.reply(`📊 Group: ${chat.title}\nMembers: ${count}\nAdmins: ${admins.length}`);
    } catch { ctx.reply('❌ Failed!'); }
});
bot.command('grouplink', async (ctx) => {
    if (!await isAdmin(ctx, ctx.from.id)) return;
    try { const link = await ctx.exportChatInviteLink(); ctx.reply(`🔗 ${link}`); } catch { ctx.reply('❌ Failed!'); }
});

// --- FIXED TAGALL (Tags ALL Members) ---
bot.command('tagall', async (ctx) => {
    if (!await isAdmin(ctx, ctx.from.id)) return ctx.reply('❌ You need to be admin!');
    try {
        const msg = await ctx.reply('⏳ Fetching members...');
        let mentions = '📢 **Attention Everyone!**\n\n';
        let count = 0;
        const admins = await ctx.getChatAdministrators();
        const members = await ctx.getChatMembersCount();
        for (const admin of admins) {
            if (count >= 50) break;
            const user = admin.user;
            if (user.username) {
                mentions += `@${user.username} `;
            } else {
                mentions += `[${user.first_name}](tg://user?id=${user.id}) `;
            }
            count++;
        }
        if (members > admins.length) {
            mentions += `\n\n*...and ${members - admins.length} other members*`;
        }
        await ctx.deleteMessage(msg.message_id);
        await ctx.reply(mentions, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Tagall error:', error);
        ctx.reply('❌ Failed to tag all members.');
    }
});

bot.command('setdesc', async (ctx) => {
    if (!await isAdmin(ctx, ctx.from.id)) return;
    const t = ctx.message.text.replace('/setdesc', '').trim();
    if (!t) return ctx.reply('❌ Usage: /setdesc <description>');
    try { await ctx.setChatDescription(t); ctx.reply('✅ Description set!'); } catch { ctx.reply('❌ Failed!'); }
});
bot.command('disp', async (ctx) => {
    try {
        const count = await ctx.getChatMembersCount();
        const admins = await ctx.getChatAdministrators();
        ctx.reply(`📊 Stats\nMembers: ${count}\nAdmins: ${admins.length}\nWarn limit: ${s.warnLimit}\nAnti-link: ${s.antiLink ? 'ON' : 'OFF'}`);
    } catch { ctx.reply('❌ Failed!'); }
});
bot.command('stats', (ctx) => {
    ctx.reply(`📊 Settings\nAnti-link: ${s.antiLink ? 'ON' : 'OFF'}\nAnti-image: ${s.antiImage ? 'ON' : 'OFF'}\nAnti-video: ${s.antiVideo ? 'ON' : 'OFF'}\nAnti-sticker: ${s.antiSticker ? 'ON' : 'OFF'}\nAnti-audio: ${s.antiAudio ? 'ON' : 'OFF'}\nAnti-mention: ${s.antiMention ? 'ON' : 'OFF'}\nAnti-group-link: ${s.antiGroupLink ? 'ON' : 'OFF'}\nWarn limit: ${s.warnLimit}\nAdmin-only: ${s.onlyAdmins ? 'ON' : 'OFF'}`);
});

// --- ANTI COMMANDS ---
const antiCmds = ['antilink','antiimage','antivideo','antisticker','antiaudio','antimention','antigrouplink'];
antiCmds.forEach(cmd => {
    bot.command(cmd, async (ctx) => {
        if (!await isAdmin(ctx, ctx.from.id)) return;
        const v = ctx.message.text.split(' ')[1]?.toLowerCase();
        if (v === 'on' || v === 'off') {
            const map = { link: 'antiLink', image: 'antiImage', video: 'antiVideo', sticker: 'antiSticker', audio: 'antiAudio', mention: 'antiMention', grouplink: 'antiGroupLink' };
            const key = cmd.replace('anti', '');
            s[map[key]] = v === 'on';
            ctx.reply(`✅ ${cmd} ${v === 'on' ? 'enabled' : 'disabled'}`);
        } else { ctx.reply(`❌ /${cmd} on/off`); }
    });
});

// --- AUTO ANTI-ABUSE (SKIPS OWNER) ---
bot.on('text', async (ctx) => {
    if (!ctx.chat.type.includes('group') && !ctx.chat.type.includes('supergroup')) return;
    if (!await isBotAdmin(ctx)) return;
    if (ctx.from.id === OWNER_ID) return;
    const t = ctx.message.text;
    if (s.antiLink && /(https?:\/\/|t\.me\/)/i.test(t)) { await ctx.deleteMessage(); await ctx.reply('❌ Links not allowed!'); return; }
    if (s.antiMention && t.includes('@')) { await ctx.deleteMessage(); await ctx.reply('❌ Mentions not allowed!'); return; }
    if (s.antiGroupLink && /t\.me\/[a-zA-Z0-9_]+/i.test(t)) { await ctx.deleteMessage(); await ctx.reply('❌ Group links not allowed!'); return; }
    if (s.onlyAdmins && !await isAdmin(ctx, ctx.from.id)) { await ctx.deleteMessage(); await ctx.reply('❌ Only admins can send!'); return; }
});

bot.on(['photo','video','document','audio','sticker'], async (ctx) => {
    if (!ctx.chat.type.includes('group') && !ctx.chat.type.includes('supergroup')) return;
    if (!await isBotAdmin(ctx)) return;
    if (ctx.from.id === OWNER_ID) return;
    const type = ctx.message;
    let blocked = false, reason = '';
    if (s.antiImage && type.photo) { blocked = true; reason = 'Images'; }
    else if (s.antiVideo && type.video) { blocked = true; reason = 'Videos'; }
    else if (s.antiSticker && type.sticker) { blocked = true; reason = 'Stickers'; }
    else if (s.antiAudio && (type.audio || type.voice)) { blocked = true; reason = 'Audio'; }
    if (blocked) { await ctx.deleteMessage(); await ctx.reply(`❌ ${reason} not allowed!`); }
});

};
