import {BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Conversation} from "./Conversation";


@Entity()
export class Message extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    role: string;

    @Column()
    content: string;

    @ManyToOne(() => Conversation, (conversation) => conversation.messages, {onDelete: "CASCADE"})
    conversation: Conversation;
}