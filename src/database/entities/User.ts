import {BaseEntity, Column, Entity, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {Message} from "./Message";
import {Conversation} from "./Conversation";

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    passwordHash: string;

    @ManyToMany(() => Conversation, (conversation) => conversation.users, {onDelete: "CASCADE"})
    conversations: Conversation[];
}