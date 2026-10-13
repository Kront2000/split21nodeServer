import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, Relation } from "typeorm"
import { UserStats} from './UserStats'
import {Games} from "./Games"
import { GameMoves } from "./GameMoves"
@Entity()
export class Users {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({type: "varchar", length: 20, unique: true})
    login!: string

    @Column({type: "varchar", length: "44"})
    password!: string

    @Column({type: "timestamptz", default: () => "CURRENT_TIMESTAMP"})
    created_at!: Date

    @OneToOne(() => UserStats, (user_stats) => user_stats.users)
    user_stats!: Relation<UserStats>

    @OneToMany(() => Games, (games) => games.player1_id)
    player1_games!: Relation<Games>[]

    @OneToMany(() => Games, (games) => games.player2_id)
    player2_games!: Relation<Games>[]

    @OneToMany(() => Games, (games) => games.winner_id)
    winner_games!: Relation<Games>[]

    @OneToMany(() => GameMoves, (gameMoves) => gameMoves.player_id)
    game_moves!: GameMoves[]
    
}