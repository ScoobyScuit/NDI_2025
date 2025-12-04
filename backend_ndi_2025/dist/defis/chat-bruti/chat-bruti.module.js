"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatBrutiModule = void 0;
const common_1 = require("@nestjs/common");
const chat_bruti_controller_1 = require("./controller/chat-bruti.controller");
const chat_bruti_service_1 = require("./services/chat-bruti.service");
let ChatBrutiModule = class ChatBrutiModule {
};
exports.ChatBrutiModule = ChatBrutiModule;
exports.ChatBrutiModule = ChatBrutiModule = __decorate([
    (0, common_1.Module)({
        controllers: [chat_bruti_controller_1.ChatBrutiController],
        providers: [chat_bruti_service_1.ChatBrutiService],
    })
], ChatBrutiModule);
//# sourceMappingURL=chat-bruti.module.js.map