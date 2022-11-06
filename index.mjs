import { Reader } from '@necodeo/buffer';
import { A2S_INFO, A2S_INFO_OLD, A2S_CHALLANGE, A2S_PLAYERS, A2S_RULES } from './packets.mjs';

import { DgramAsPromised as dgram } from 'dgram-as-promised';

class SourceQuery {
    constructor(ip, port) {
        this.ip = ip;
        this.port = port;

        this.info = {};
        this.challange = Buffer.alloc(4);
        this.players = {};
        this.rules = {};

        let last_id = 0;
        let payloads = [];

        const parse = (a) => {
            const packet = new Reader(a.msg)
                .uint32le('is_split', data => data.is_split === 4294967294 ? true : false)
                .uint8('type')
                .rest('data')
                .get();

            if (packet.is_split) {
                let s = new Reader(a.msg)
                    .uint32le('header')
                    .uint32le('id')
                    .uint8('extra') // packets_num / payload_offset
                    .rest('payload')
                    .get();

                if (typeof payloads['_' + s.id] == 'undefined') {
                    payloads['_' + s.id] = [];
                }
                payloads['_' + s.id].push(s.payload);
                last_id = '_' + s.id;
                return;
            }

            const data = new Reader(packet.data);
            switch (packet.type) {
                case 0x41:
                    this.challange = A2S_CHALLANGE(data).challange;
                    break;
                case 0x44:
                    this.players = A2S_PLAYERS(data, info.app_id);
                    break;
                case 0x45:
                    this.rules = A2S_RULES(data);
                    break;
                case 0x49:
                    this.info = A2S_INFO(data);
                    break;
                case 0x6d:
                    this.info = A2S_INFO_OLD(data);
                    break;
                default:
                    console.log(`Unknown packet type ${packet.type.toString(16)}`);
            }
        };

        this.getInfo = async function () {
            const socket = dgram.createSocket('udp4');
            await socket.send(Buffer.from('\xFF\xFF\xFF\xFFT' + 'Source Engine Query\x00', 'ascii'), this.port, this.ip); // A2S_INFO
            parse(await socket.recv());
            await socket.close();

            return this.info;
        };

        this.getPlayers = async function () {
            const socket = dgram.createSocket('udp4');
            await socket.send(Buffer.from('\xFF\xFF\xFF\xFFU' + '\xFF\xFF\xFF\xFF', 'ascii'), this.port, this.ip); // A2S_PLAYER_CHALLANGE
            parse(await socket.recv());
            await socket.send(Buffer.concat([Buffer.from('\xFF\xFF\xFF\xFFU', 'ascii'), challange]), this.port, this.ip); // A2S_PLAYERS
            parse(await socket.recv());
            await socket.close();

            return this.players;
        };

        this.getRules = async function () {
            const socket = dgram.createSocket('udp4');
            await socket.send(Buffer.from('\xFF\xFF\xFF\xFFV' + '\xFF\xFF\xFF\xFF', 'ascii'), this.port, this.ip); // A2S_RULES_CHALLANGE
            parse(await socket.recv());
            await socket.send(Buffer.concat([Buffer.from('\xFF\xFF\xFF\xFFV', 'ascii'), challange]), this.port, this.ip); // A2S_RULES
            parse(await socket.recv());
            parse(await socket.recv());
            parse({ msg: Buffer.concat(payloads[last_id]) });
            await socket.close();

            return this.rules;
        };
    }
}

export {
    SourceQuery,
    // MinecraftQuery
}
