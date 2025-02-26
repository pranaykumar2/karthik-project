import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class File {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    fileName!: string;

    @Column()
    ipfsCid!: string;

    @Column()
    description!: string;

    @Column()
    culpritName!: string;

    @Column('text')
    custodyDetails!: string;

    @Column()
    fileSize!: number;

    @Column()
    mimeType!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}