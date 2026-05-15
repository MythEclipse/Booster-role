# Booster Role Bot

Discord bot untuk memberi role custom kosmetik ke user yang sedang boost server. Role dibuat oleh bot, tidak boleh mengambil role yang sudah ada, dan otomatis dihapus saat user tidak lagi eligible.

## Tech stack

- Bun + TypeScript
- discord.js
- SQLite via `bun:sqlite` + Drizzle schema
- Bun test runner

## Prasyarat

- Bun terinstall
- Bot Discord dengan token dari Developer Portal
- Test guild/server Discord
- Bot punya permission `Manage Roles`
- Posisi role bot harus lebih tinggi dari role custom yang akan dibuat

## Setup

```bash
bun install
cp .env.example .env
```

Isi `.env`:

```env
DISCORD_TOKEN=token_bot_discord
DISCORD_CLIENT_ID=client_id_aplikasi_discord
DISCORD_GUILD_ID=id_server_discord
DATABASE_URL=file:./data/booster-role.sqlite
BOOSTER_ROLE_ANCHOR_ROLE_ID=id_role_pembatas_opsional
```

`BOOSTER_ROLE_ANCHOR_ROLE_ID` dipakai sebagai batas posisi role. Role booster custom harus berada di bawah role ini agar tetap kosmetik dan tidak menyentuh role staff/admin.

## Database

Generate dan jalankan migration setelah schema siap:

```bash
bun run db:generate
bun run db:migrate
```

SQLite default tersimpan di `./data/booster-role.sqlite`.

## Menjalankan bot

```bash
bun run dev
```

Saat startup, bot otomatis register slash command ke guild dari `DISCORD_GUILD_ID`, lalu menangani interaction command. Pastikan bot di-invite dengan scope `applications.commands`.

## Testing

```bash
bun test
bun test src/domain/roleGuards.test.ts
bun run typecheck
bun run lint
```

## Keamanan role

Bot ini dirancang supaya aman dari abuse:

- User tidak bisa claim role Discord yang sudah ada.
- Claim selalu membuat role baru yang dikelola bot.
- Rename, recolor, dan delete hanya berlaku untuk role yang tercatat di database sebagai milik user tersebut.
- Role custom dibuat dengan permission kosong.
- Icon/logo role opsional hanya bisa dipasang ke role bot-managed milik user tersebut.
- Attachment icon harus berupa image dan dibatasi ukuran agar tidak disalahgunakan.
- Permission berbahaya seperti `Administrator`, `ManageRoles`, `ManageChannels`, `BanMembers`, `KickMembers`, `MentionEveryone`, `ManageGuild`, dan `ManageWebhooks` ditolak.
- Jika user tidak sedang boost server, claim ditolak.

## Slash command target

Command utama yang disiapkan:

- `/booster-role claim name color icon` - claim role custom baru, dengan icon opsional.
- `/booster-role rename name` - rename role milik sendiri.
- `/booster-role recolor color` - ubah warna role milik sendiri.
- `/booster-role icon image` - pasang atau ganti logo/icon role milik sendiri.
- `/booster-role delete` - hapus role milik sendiri.

## Catatan eligibility boost

Untuk sekarang, user eligible jika sedang boost server (`premiumSince` aktif). Jika user berhenti boost, role bot-managed miliknya akan dihapus lewat event `guildMemberUpdate`.
