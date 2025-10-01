import {BaseEntity, Column, Entity, ManyToMany, OneToMany, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
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

    @OneToMany(() => Conversation, (conversation) => conversation.owner, {onDelete: "CASCADE"})
    conversations: Conversation[];
}