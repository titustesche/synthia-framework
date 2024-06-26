import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, serialize } from "typeorm";
import { serializeJs } from "serialize-js";

@Entity()
export class Memory extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    topic: string

    @Column({type: 'text'})
    keywords: string

    getKeywords(): string[] {
        return JSON.parse(serializeJs(this.keywords));
    }

    @Column()
    description: string

    @Column()
    context: string

    @Column()
    createdAt: Date

    @Column('float', { precision: 1, scale: 1 })
    importance: number
}