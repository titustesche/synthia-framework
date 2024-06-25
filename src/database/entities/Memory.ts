import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Memory extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    topic: string

    @Column()
    keywords: string[]

    @Column()
    description: string

    @Column()
    context: string

    @Column()
    createdAt: Date

    @Column()
    importance: number
}