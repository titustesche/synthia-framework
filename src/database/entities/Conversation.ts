import {
    BaseEntity,
    Column,
    Entity,
    ManyToMany, ManyToOne,
    OneToMany,
    PrimaryColumn,
} from "typeorm";
import {Message} from "./Message";
import {User} from "./User";


@Entity()
export class Conversation extends BaseEntity {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @OneToMany(() => Message, (message) => message.conversation, {onDelete: "CASCADE"})
    messages: Message[];

    // ManyToMany in order to support shared chats
    @ManyToOne(() => User, (user) => user.conversations, {onDelete: "CASCADE"})
    owner: User;
}