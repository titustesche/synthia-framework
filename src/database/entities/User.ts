import {BaseEntity, Column, Entity, ManyToMany, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {Message} from "./Message";
import {Conversation} from "./Conversation";

@Entity()
export class User extends BaseEntity {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    passwordHash: string;

    @ManyToMany(() => Conversation, (conversation) => conversation.users, {onDelete: "CASCADE"})
    conversations: Conversation[];
}