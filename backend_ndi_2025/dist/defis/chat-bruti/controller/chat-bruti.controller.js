"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatBrutiController = void 0;
const common_1 = require("@nestjs/common");
const chat_bruti_service_1 = require("../services/chat-bruti.service");
const chat_message_dto_1 = require("../model/chat-message.dto");
let ChatBrutiController = class ChatBrutiController {
    chatBrutiService;
    constructor(chatBrutiService) {
        this.chatBrutiService = chatBrutiService;
    }
    async sendMessage(chatMessageDto) {
        return await this.chatBrutiService.getChatResponse(chatMessageDto.message);
    }
    getInfo() {
        return {
            name: 'Bruti',
            description: 'Un chatbot complètement à côté de la plaque mais hilarant, persuadé d\'être un philosophe du dimanche !',
        };
    }
};
exports.ChatBrutiController = ChatBrutiController;
__decorate([
    (0, common_1.Post)('message'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_message_dto_1.ChatMessageDto]),
    __metadata("design:returntype", Promise)
], ChatBrutiController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], ChatBrutiController.prototype, "getInfo", null);
exports.ChatBrutiController = ChatBrutiController = __decorate([
    (0, common_1.Controller)('chat-bruti'),
    __metadata("design:paramtypes", [chat_bruti_service_1.ChatBrutiService])
], ChatBrutiController);
//# sourceMappingURL=chat-bruti.controller.js.map