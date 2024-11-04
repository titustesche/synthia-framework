import {BaseEntity, Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Message} from "./Message";
import {User} from "./User";


@Entity()
export class Conversation extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(() => Message, (message) => message.conversation, {onDelete: "CASCADE"})
    messages: Message[];

    @ManyToMany(() => User, (user) => user.conversations, {onDelete: "CASCADE"})
    users: User[];
}