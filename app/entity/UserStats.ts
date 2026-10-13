import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, Relation } from "typeorm"
import {Users} from "./Users"
@Entity()
export class UserStats {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({type: "integer", default: 0})
    wins!: number

    @Column({type: "integer", default: 0})
    losses!: number

    @Column({type: "integer", default: 0})
    draws!: number

    @Column({type: "smallint", default: 0})
    max_score!: number

    @Column({type: "integer", default: 0})
    rating_ai!: number

    @Column({type: "integer", default: 0})
    rating_pvp!: number

    @Column({type: "timestamptz", default: () => "CURRENT_TIMESTAMP"})
    updated_at!: Date

    @OneToOne(() => Users, (users) => users.user_stats)
    @JoinColumn({ name: "user_id" })
    users!: Relation<Users>
}