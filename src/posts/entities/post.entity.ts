import {Column, Entity, ManyToOne, PrimaryGeneratedColumn, ManyToMany, JoinTable} from 'typeorm';
import User from "../../users/entities/user.entity";
import Category from "../../categories/entities/category.entity";

@Entity()
class Post {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public title: string;

    @Column()
    public content: string;

    @Column({nullable: true})
    public category?: string;

    @ManyToOne(() => User, (author: User) => author.posts)
    public author: User;


    @ManyToMany(() => Category, (category: Category) => category.posts)
    @JoinTable()
    public categories: Category[];

}

export default Post;