import { Module } from '@nestjs/common';
import { SocketGateway } from './gateway/socket/socket.gateway';
import { SocketManagerService } from './services/socket-manager/socket-manager.service';
import { SocketCacheService } from './services/socket-cache/socket-cache.service';
import { SocketService } from './socket.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { RedisModule } from 'src/redis/redis.module';
import { ConversationModule } from 'src/conversation/conversation.module';
import { SocketAuthGuard } from './guards/socket-auth/socket-auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConvParticipant } from 'src/conversation/entities/convParticipant.entity';
import { SocketAuthService } from './services/socket-auth/socket-auth.service';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';

@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('jwt.accessToken.secret'),
                signOptions: {
                    expiresIn: configService.get('jwt.accessToken.expiresIn'),
                },
            }),
        }),
        TypeOrmModule.forFeature([ConvParticipant]),
        UserModule,
        RedisModule,
        ConversationModule,
        RabbitmqModule,
    ],
    providers: [
        SocketGateway,
        SocketManagerService,
        SocketCacheService,
        SocketService,
        SocketAuthGuard,
        SocketAuthService,
    ],
    exports: [SocketService],
})
export class SocketModule {}
