import {
    BaseEntity,
    Column,
    Entity,
    ManyToMany,
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

    @ManyToMany(() => User, (user) => user.conversations, {onDelete: "CASCADE"})
    users: User[];
}