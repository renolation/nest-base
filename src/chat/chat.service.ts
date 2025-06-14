import { Injectable } from '@nestjs/common';
import { AuthenticationService } from '../authentication/authentication.service';
import { Socket } from 'socket.io';
import { parse } from 'cookie';
import { WsException } from '@nestjs/websockets';
import UserEntity from "../users/entities/user.entity";
import {InjectRepository} from "@nestjs/typeorm";
import Message from "./mesage.entity";
import {Repository} from "typeorm";

@Injectable()
export class ChatService {
    constructor(
        private readonly authenticationService: AuthenticationService,
        @InjectRepository(Message)
        private messagesRepository: Repository<Message>,
    ) {
    }

    async saveMessage(content: string, author: UserEntity) {
        const newMessage = this.messagesRepository.create({
            content,
            author
        });
        await this.messagesRepository.save(newMessage);
        return newMessage;
    }

    async getAllMessages() {
        return this.messagesRepository.find({
            relations: {
                author: true,
            }
        });
    }

    async getUserFromSocket(socket: Socket) {
        const cookie = socket.handshake.headers.cookie;
        const { Authentication: authenticationToken } = parse(cookie);
        const user = await this.authenticationService.getUserFromAuthenticationToken(authenticationToken);
        if (!user) {
            throw new WsException('Invalid credentials.');
        }
        return user;
    }
}

