import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToMany, ManyToOne, OneToMany, Relation } from "typeorm"
import {Users} from "./Users"
import { GameMoves } from "./GameMoves"

export enum GameType {
    AI = "ai",
    PVP = "pvp",
}

export enum STATUS {
    IN_PROGRESS = "in_progress",
    FINISHED = "finished",
    ABANDONED = "abandoned"
}

@Entity()
export class Games {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({type: "enum", enum: GameType, default: GameType.AI})
    game_type!: GameType

    @ManyToOne(() => Users, (user) => user.player1_games)
    @JoinColumn({ name: "player1_id" })
    player1_id!: Relation<Users>

    @ManyToOne(() => Users, (user) => user.player2_games)
    @JoinColumn({ name: "player2_id" })
    player2_id!: Relation<Users>

    @ManyToOne(() => Users, (user) => user.winner_games)
    @JoinColumn({ name: "winner_id" })
    winner_id!: Relation<Users>

    @Column({type: "enum", enum: STATUS, default: STATUS.IN_PROGRESS})
    status!: Relation<STATUS>

    @Column({type: "smallint", default: 0})
    player1_score!: number

    @Column({type: "smallint", default: 0})
    player2_score!: number

    @Column({type: "timestamptz", default: () => "CURRENT_TIMESTAMP"})
    started_at!: Date

    @Column({type: "timestamptz", nullable: true})
    ended_at!: Date

    @OneToMany(() => GameMoves, (gameMoves) => gameMoves.game_id)
        game_moves!: Relation<GameMoves>[]
}