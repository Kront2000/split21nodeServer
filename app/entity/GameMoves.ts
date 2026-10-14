import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToMany, ManyToOne, Relation } from "typeorm"
import {Users} from "./Users"
import {Games} from "./Games"

export enum ACTION {
    TAKE = "take",
    PASS = "pass",
}

@Entity()
export class GameMoves {
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(() => Games, (games) => games.game_moves)
    @JoinColumn({ name: "games_id" })
    game_id!: Relation<Games>

    @ManyToOne(() => Users, (user) => user.game_moves)
    @JoinColumn({ name: "player_id" })
    player_id!: Relation<Users>

    @Column({type: "integer", default: 0})
    step_number!: number

    @Column({type: "enum", enum: ACTION})
    action!: ACTION

    @Column({type: "varchar", length: 20, nullable: true})
    card_drawn!: string

    @Column({type: "integer"})
    point_after_move!: number

    @Column({type: "timestamptz", default: () => "CURRENT_TIMESTAMP"})
    created_at!: Date
}