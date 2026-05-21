CREATE TABLE "booster_roles" (
	"guild_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role_id" text NOT NULL,
	"name" text NOT NULL,
	"color" text,
	"icon" text,
	"created_at" integer NOT NULL,
	"updated_at" integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "booster_roles_guild_user_idx" ON "booster_roles" USING btree ("guild_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "booster_roles_guild_role_idx" ON "booster_roles" USING btree ("guild_id","role_id");