import { and, eq } from "drizzle-orm";
import { boosterRoles } from "../db/schema";
import type { BoosterRoleRecord, BoosterRoleStore } from "./boosterRoleService";

type DatabaseLike = {
  select(): {
    from(table: typeof boosterRoles): {
      where(condition: unknown): {
        limit(count: number): Promise<BoosterRoleRecord[]> | BoosterRoleRecord[];
      };
    };
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

  async create(record: BoosterRoleRecord): Promise<void> {
    await this.db.insert(boosterRoles).values(record);
  }

  async delete(guildId: string, userId: string): Promise<void> {
    await this.db
      .delete(boosterRoles)
      .where(and(eq(boosterRoles.guildId, guildId), eq(boosterRoles.userId, userId)));
  }
}
