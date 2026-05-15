import type { Database } from "bun:sqlite";
import type { BoosterRoleRecord, BoosterRoleStore } from "./boosterRoleService";

export class BunSqliteBoosterRoleStore implements BoosterRoleStore {
  constructor(private readonly db: Database) {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS booster_roles (
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role_id TEXT NOT NULL,
        name TEXT NOT NULL,
        color TEXT,
        icon TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        UNIQUE(guild_id, user_id),
        UNIQUE(guild_id, role_id)
      )
    `);
  }

  async findByUser(guildId: string, userId: string): Promise<BoosterRoleRecord | null> {
    const row = this.db
      .query<BoosterRoleRow, [string, string]>(`
        SELECT guild_id, user_id, role_id, name, color, icon, created_at, updated_at
        FROM booster_roles
        WHERE guild_id = ? AND user_id = ?
        LIMIT 1
      `)
      .get(guildId, userId);

    return row ? toRecord(row) : null;
  }

  async create(record: BoosterRoleRecord): Promise<void> {
    this.db
      .query<unknown, [string, string, string, string, string | null, string | null, number, number]>(`
        INSERT INTO booster_roles (guild_id, user_id, role_id, name, color, icon, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(record.guildId, record.userId, record.roleId, record.name, record.color, record.icon, record.createdAt, record.updatedAt);
  }

  async delete(guildId: string, userId: string): Promise<void> {
    this.db.query<unknown, [string, string]>("DELETE FROM booster_roles WHERE guild_id = ? AND user_id = ?").run(guildId, userId);
  }
}

type BoosterRoleRow = {
  guild_id: string;
  user_id: string;
  role_id: string;
  name: string;
  color: string | null;
  icon: string | null;
  created_at: number;
  updated_at: number;
};

function toRecord(row: BoosterRoleRow): BoosterRoleRecord {
  return {
    guildId: row.guild_id,
    userId: row.user_id,
    roleId: row.role_id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
