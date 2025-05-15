import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, QueryRunner} from 'typeorm';
import PublicFile from './publicFile.entity';
import {S3} from 'aws-sdk';
import {ConfigService} from '@nestjs/config';
import {v4 as uuid} from 'uuid';
import {File} from "../core/file.interface";
import {s3} from "../core/s3-config";

@Injectable()
export class FilesService {
    constructor(
        @InjectRepository(PublicFile)
        private publicFilesRepository: Repository<PublicFile>,
        private readonly configService: ConfigService,
    ) {
    }

    async uploadPublicFile(dataBuffer: Buffer, filename: string) {
        const uploadResult = await s3.upload({
            ACL: 'public-read',
            Bucket: 'nest-reno',
            Body: dataBuffer,
            Key: filename,
        })
            .promise();


        const newFile = this.publicFilesRepository.create({
            key: uploadResult.Key,
            url: uploadResult.Location,
        });
        await this.publicFilesRepository.save(newFile);
        return newFile;

    }

    async uploadFile(file: File, folder: String) {
        const uploadResult = await s3.upload({
            ACL: 'public-read',
            Bucket: folder,
            Body: file.buffer,
            Key: file.originalname,
            ContentType: file.mimetype,
        })
            .promise();
        return uploadResult['Location'];
    }

    async deletePublicFile(fileId: number) {
        const file = await this.publicFilesRepository.findOneBy({id: fileId});
        await s3
            .deleteObject({
                Bucket: this.configService.get('S3_BUCKET'),
                Key: file.key,
            })
            .promise();
        await this.publicFilesRepository.delete(fileId);
    }

    async deletePublicFileWithQueryRunner(
        fileId: number,
        queryRunner: QueryRunner,
    ) {
        const file = await queryRunner.manager.findOneBy(PublicFile, {
            id: fileId,
        });
        const s3 = new S3();
        await s3
            .deleteObject({
                Bucket: this.configService.get('S3_BUCKET'),
                Key: file.key,
            })
            .promise();
        await queryRunner.manager.delete(PublicFile, fileId);
    }
}