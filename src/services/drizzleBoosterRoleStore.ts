import { and, eq } from "drizzle-orm";
import { boosterRoles } from "../db/schema";

export type BoosterRoleRecord = {
  guildId: string;
  userId: string;
  roleId: string;
  name: string;
  color: string | null;
  color2: string | null;
  icon: string | null;
  createdAt: number;
  updatedAt: number;
};

export type BoosterRoleStore = {
  findByUser(guildId: string, userId: string): Promise<BoosterRoleRecord | null>;
  findByGuild(guildId: string): Promise<BoosterRoleRecord[]>;
  create(record: BoosterRoleRecord): Promise<void>;
  delete(guildId: string, userId: string): Promise<void>;
};

type SelectQuery = {
  where(condition: unknown): QueryWithLimit & Promise<BoosterRoleRecord[]>;
};

type QueryWithLimit = {
  limit(count: number): Promise<BoosterRoleRecord[]> | BoosterRoleRecord[];
};

type DatabaseLike = {
  select(): {
    from(table: typeof boosterRoles): SelectQuery;
  };
  insert(table: typeof boosterRoles): {
    values(record: BoosterRoleRecord): Promise<unknown> | unknown;
  };
  delete(table: typeof boosterRoles): {
    where(condition: unknown): Promise<unknown> | unknown;
  };
};

export class DrizzleBoosterRoleStore implements BoosterRoleStore {
  constructor(private readonly db: DatabaseLike) {}

  async findByUser(guildId: string, userId: string): Promise<BoosterRoleRecord | null> {
    const rows = await this.db
      .select()
      .from(boosterRoles)
      .where(and(eq(boosterRoles.guildId, guildId), eq(boosterRoles.userId, userId)))
      .limit(1);

    return rows[0] ?? null;
  }

  async findByGuild(guildId: string): Promise<BoosterRoleRecord[]> {
    return await this.db
      .select()
      .from(boosterRoles)
      .where(eq(boosterRoles.guildId, guildId));
  }

  async create(record: BoosterRoleRecord): Promise<void> {
    await this.db.insert(boosterRoles).values(record);
  }

  async delete(guildId: string, userId: string): Promise<void> {
    await this.db
      .delete(boosterRoles)
      .where(and(eq(boosterRoles.guildId, guildId), eq(boosterRoles.userId, userId)));
  }
}
