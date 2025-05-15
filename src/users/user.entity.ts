import {Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany} from 'typeorm';
import {Exclude, Expose} from 'class-transformer';
import Address from "./address.entity";
import Post from "../posts/entities/post.entity";

@Entity()
class User {
    @PrimaryGeneratedColumn()
    public id?: number;

    @Column({unique: true})
    @Expose()
    public email: string;

    @Column()
    @Expose()
    public name: string;

    @Column()
    public password: string;

    @OneToOne(() => Address, {
        eager: true,
        cascade: true
    })
    @JoinColumn()
    public address: Address;


    @OneToMany(() => Post, (post: Post) => post.author)
    public posts: Post[];


    @Column({
        nullable: true,
    })
    @Exclude()
    public currentHashedRefreshToken?: string;

    @Column({default: false})
    public isTwoFactorAuthenticationEnabled: boolean;

}

export default User;
