import { Client, Collection } from "discord.js";

export class CommandEnabledClient extends Client {
    commands: Collection<string, NodeModule> = new Collection<string, NodeModule>(); // Adjust the generic types of Collection if needed.
}