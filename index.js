const { Client, GatewayIntentBits, PermissionFlagsBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const uyarilar = new Map();
const commands = [
  new SlashCommandBuilder().setName('adminver').setDescription('Bot yöneticisi yetkisi ver (Sadece sunucu sahibi)').setDefaultMemberPermissions(PermissionFlagsBits.Administrator).addUserOption(o => o.setName('kullanici').setDescription('Kullanıcı').setRequired(true)),
  new SlashCommandBuilder().setName('ban').setDescription('Kullanıcıyı banla').setDefaultMemberPermissions(PermissionFlagsBits.BanMembers).addUserOption(o => o.setName('kullanici').setDescription('Kullanıcı').setRequired(true)).addStringOption(o => o.setName('sebep').setDescription('Sebep').setRequired(false)),
  new SlashCommandBuilder().setName('kick').setDescription('Kullanıcıyı at').setDefaultMemberPermissions(PermissionFlagsBits.KickMembers).addUserOption(o => o.setName('kullanici').setDescription('Kullanıcı').setRequired(true)).addStringOption(o => o.setName('sebep').setDescription('Sebep').setRequired(false)),
  new SlashCommandBuilder().setName('mute').setDescription('Kullanıcıyı sustur').setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers).addUserOption(o => o.setName('kullanici').setDescription('Kullanıcı').setRequired(true)).addIntegerOption(o => o.setName('dakika').setDescription('Dakika').setRequired(true).setMinValue(1).setMaxValue(40320)).addStringOption(o => o.setName('sebep').setDescription('Sebep').setRequired(false)),
  new SlashCommandBuilder().setName('unmute').setDescription('Susturmayı kaldır').setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers).addUserOption(o => o.setName('kullanici').setDescription('Kullanıcı').setRequired(true)),
  new SlashCommandBuilder().setName('uyar').setDescription('Kullanıcıya uyarı ver').setDefaultMemberPermissions(PermissionFlagsBits.KickMembers).addUserOption(o => o.setName('kullanici').setDescription('Kullanıcı').setRequired(true)).addStringOption(o => o.setName('sebep').setDescription('Sebep').setRequired(true)),
  new SlashCommandBuilder().setName('temizle').setDescription('Mesajları toplu sil').setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages).addIntegerOption(o => o.setName('adet').setDescription('Adet (max 100)').setRequired(true).setMinValue(1).setMaxValue(100)),
  new SlashCommandBuilder().setName('kullanicibilgi').setDescription('Kullanıcı bilgisi göster').addUserOption(o => o.setName('kullanici').setDescription('Kullanıcı').setRequired(false)),
  new SlashCommandBuilder().setName('duyuru').setDescription('Kanala duyuru gönder').setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages).addStringOption(o => o.setName('mesaj').setDescription('Mesaj').setRequired(true)).addChannelOption(o => o.setName('kanal').setDescription('Kanal').setRequired(false).addChannelTypes(ChannelType.GuildText)),
  new SlashCommandBuilder().setName('rolver').setDescription('Kullanıcıya rol ver').setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles).addUserOption(o => o.setName('kullanici').setDescription('Kullanıcı').setRequired(true)).addRoleOption(o => o.setName('rol').setDescription('Rol').setRequired(true)),
  new SlashCommandBuilder().setName('rolal').setDescription('Kullanıcıdan rol al').setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles).addUserOption(o => o.setName('kullanici').setDescription('Kullanıcı').setRequired(true)).addRoleOption(o => o.setName('rol').setDescription('Rol').setRequired(true)),
  new SlashCommandBuilder().setName('kurucu').setDescription('Kurucu bilgisi').setDMPermission(true),
].map(cmd => cmd.toJSON());
client.once('clientReady', async () => {
  console.log(`Bot hazır! ${client.user.tag}`);
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try { await rest.put(Routes.applicationCommands(client.user.id), { body: commands }); console.log('Komutlar kaydedildi!'); } catch (e) { console.error(e); }
});
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  await interaction.deferReply({ ephemeral: true });
  if (interaction.commandName === 'adminver') {
    if (interaction.user.id !== interaction.guild.ownerId) return interaction.editReply("❌ Sadece sunucu sahibi kullanabilir!");
    const target = interaction.options.getMember('kullanici');
    if (!target) return interaction.editReply("❌ Kullanıcı bulunamadı.");
    let rol = interaction.guild.roles.cache.find(r => r.name === 'Bot Yöneticisi');
    if (!rol) { try { rol = await interaction.guild.roles.create({ name: 'Bot Yöneticisi', color: 0x5865F2, permissions: [PermissionFlagsBits.BanMembers, PermissionFlagsBits.KickMembers, PermissionFlagsBits.ManageRoles, PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.ManageMessages] }); } catch (e) { return interaction.editReply("❌ Rol oluşturulamadı."); } }
    try { await target.roles.add(rol); await interaction.editReply(`✅ **${target.user.tag}** kullanıcısına Bot Yöneticisi rolü verildi!`); } catch (e) { await interaction.editReply("❌ Hata oluştu."); }
  } else if (interaction.commandName === 'ban') {
    const target = interaction.options.getMember('kullanici');
    if (!target) return interaction.editReply("❌ Kullanıcı bulunamadı.");
    if (!target.bannable) return interaction.editReply("❌ Bu kullanıcıyı banlayamıyorum.");
    const reason = interaction.options.getString('sebep') || "Sebep belirtilmedi.";
    try { await target.ban({ reason }); await interaction.editReply(`✅ **${target.user.tag}** banlandı! Sebep: ${reason}`); } catch (e) { await interaction.editReply("❌ Hata oluştu."); }
  } else if (interaction.commandName === 'kick') {
    const target = interaction.options.getMember('kullanici');
    if (!target) return interaction.editReply("❌ Kullanıcı bulunamadı.");
    if (!target.kickable) return interaction.editReply("❌ Bu kullanıcıyı atamıyorum.");
    const reason = interaction.options.getString('sebep') || "Sebep belirtilmedi.";
    try { await target.kick(reason); await interaction.editReply(`✅ **${target.user.tag}** atıldı! Sebep: ${reason}`); } catch (e) { await interaction.editReply("❌ Hata oluştu."); }
  } else if (interaction.commandName === 'mute') {
    const target = interaction.options.getMember('kullanici');
    if (!target) return interaction.editReply("❌ Kullanıcı bulunamadı.");
    if (!target.moderatable) return interaction.editReply("❌ Bu kullanıcıyı susturamıyorum.");
    const dakika = interaction.options.getInteger('dakika');
    const reason = interaction.options.getString('sebep') || "Sebep belirtilmedi.";
    try { await target.timeout(dakika * 60 * 1000, reason); await interaction.editReply(`✅ **${target.user.tag}** ${dakika} dakika susturuldu!`); } catch (e) { await interaction.editReply("❌ Hata oluştu."); }
  } else if (interaction.commandName === 'unmute') {
    const target = interaction.options.getMember('kullanici');
    if (!target) return interaction.editReply("❌ Kullanıcı bulunamadı.");
    try { await target.timeout(null); await interaction.editReply(`✅ **${target.user.tag}** susturması kaldırıldı!`); } catch (e) { await interaction.editReply("❌ Hata oluştu."); }
  } else if (interaction.commandName === 'uyar') {
    const target = interaction.options.getMember('kullanici');
    const sebep = interaction.options.getString('sebep');
    if (!target) return interaction.editReply("❌ Kullanıcı bulunamadı.");
    const uid = target.user.id;
    if (!uyarilar.has(uid)) uyarilar.set(uid, []);
    uyarilar.get(uid).push({ sebep });
    const toplam = uyarilar.get(uid).length;
    await interaction.editReply(`⚠️ **${target.user.tag}** uyarıldı! Sebep: ${sebep} | Toplam: ${toplam}`);
    try { await target.send(`⚠️ **${interaction.guild.name}** sunucusunda uyarı aldın! Sebep: ${sebep} | Toplam: ${toplam}`); } catch (_) {}
  } else if (interaction.commandName === 'temizle') {
    const adet = interaction.options.getInteger('adet');
    try { const s = await interaction.channel.bulkDelete(adet, true); await interaction.editReply(`✅ ${s.size} mesaj silindi!`); } catch (e) { await interaction.editReply("❌ Mesaj silinemedi."); }
  } else if (interaction.commandName === 'kullanicibilgi') {
    const hedef = interaction.options.getUser('kullanici') || interaction.user;
    const uye = interaction.guild?.members.cache.get(hedef.id) || await interaction.guild?.members.fetch(hedef.id).catch(() => null);
    const embed = new EmbedBuilder().setTitle(`👤 ${hedef.username}`).setThumbnail(hedef.displayAvatarURL({ size: 256 })).setColor(0x5865F2).addFields({ name: '🆔 ID', value: hedef.id, inline: true }, { name: '🤖 Bot?', value: hedef.bot ? 'Evet' : 'Hayır', inline: true }, { name: '📅 Hesap Oluşturma', value: `<t:${Math.floor(hedef.createdTimestamp / 1000)}:D>`, inline: true });
    if (uye) embed.addFields({ name: '📥 Katılma', value: `<t:${Math.floor(uye.joinedTimestamp / 1000)}:D>`, inline: true }, { name: '🎭 En Yüksek Rol', value: uye.roles.highest.name, inline: true }, { name: '⚠️ Uyarı', value: `${(uyarilar.get(hedef.id) || []).length}`, inline: true });
    await interaction.editReply({ embeds: [embed] });
  } else if (interaction.commandName === 'duyuru') {
    const mesaj = interaction.options.getString('mesaj');
    const kanal = interaction.options.getChannel('kanal') || interaction.channel;
    const embed = new EmbedBuilder().setTitle('📢 Duyuru').setDescription(mesaj).setColor(0xFEE75C).setFooter({ text: `Duyuran: ${interaction.user.username}` }).setTimestamp();
    try { await kanal.send({ embeds: [embed] }); await interaction.editReply(`✅ Duyuru gönderildi!`); } catch (e) { await interaction.editReply("❌ Duyuru gönderilemedi."); }
  } else if (interaction.commandName === 'rolver') {
    const target = interaction.options.getMember('kullanici');
    const rol = interaction.options.getRole('rol');
    if (!target) return interaction.editReply("❌ Kullanıcı bulunamadı.");
    try { await target.roles.add(rol); await interaction.editReply(`✅ **${target.user.tag}** kullanıcısına **${rol.name}** verildi!`); } catch (e) { await interaction.editReply("❌ Hata oluştu."); }
  } else if (interaction.commandName === 'rolal') {
    const target = interaction.options.getMember('kullanici');
    const rol = interaction.options.getRole('rol');
    if (!target) return interaction.editReply("❌ Kullanıcı bulunamadı.");
    try { await target.roles.remove(rol); await interaction.editReply(`✅ **${target.user.tag}** kullanıcısından **${rol.name}** alındı!`); } catch (e) { await interaction.editReply("❌ Hata oluştu."); }
  } else if (interaction.commandName === 'kurucu') {
    const embed = new EmbedBuilder().setTitle('👑 Kurucu Bilgisi').setDescription('Bu bot **oguz7694** tarafından yapılmıştır.').setColor(0xFFD700).setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  }
});
client.login(process.env.DISCORD_TOKEN);
