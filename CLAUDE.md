# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

This repository is currently a blank scaffold. There are no source files, README, package manifests, test configuration, Cursor rules, or GitHub Copilot instructions checked in.

## Target tech stack

- Bun + TypeScript - primary runtime and language for fast Discord bot development.
- discord.js - Discord gateway, slash commands, guild member, and role APIs.
- SQLite + Drizzle ORM - local persistent storage for booster role ownership and metadata.

## Planned development commands

These commands are the intended workflow after `package.json` and scripts are created:

- `bun install` - install dependencies.
- `bun run dev` - run the bot locally.
- `bun test` - run tests.
- `bun test <path>` - run a single test file.
- `bun run lint` - run linting.
- `bun run db:generate` / `bun run db:migrate` - manage Drizzle migrations.

## Target architecture

This project is intended to become a Discord bot for assigning custom cosmetic roles to users who boost the Discord server twice, then automatically removing those roles when boosting ends.

- Discord event handlers - track boost eligibility changes and remove custom roles when boosting ends.
- Slash commands - let eligible users claim, rename, recolor, or delete their custom cosmetic role.
- Role manager - create roles with no elevated permissions and keep them below staff/admin roles.
- Persistence layer - store user-to-role mappings, guild settings, and boost eligibility state.
- Permission boundary - booster-created roles must stay cosmetic and must not grant moderation, admin, channel, or integration permissions.
