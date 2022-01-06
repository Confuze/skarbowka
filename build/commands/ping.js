"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
exports.command = {
    name: "ping",
    description: "Komenda testowa do sprawdzenia działalności bota",
    category: "General",
    type: "CHAT_INPUT",
    defaultPermission: true,
    execute(i) {
        i.reply({
            content: "Pong essa byku jestem najlepszy norbirt lewandowski dostał złotą piłkę w alternatywnej rzeczywistości"
        });
    }
};
