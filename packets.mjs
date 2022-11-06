function A2S_INFO_OLD(d) {
    d.nullString('address');
    d.nullString('name');
    d.nullString('map');
    d.nullString('folder');
    d.nullString('game');
    d.uint8('players_num');
    d.uint8('players_max');
    d.uint8('protocol');
    d.string('server_type', () => 1, o => o.server_type === 'd' ? 'Dedicated' : (o.server_type === 'l' ? 'LAN' : (o.server_type === 'p' ? 'Proxy' : 'Unknown')));
    d.string('environment', () => 1, o => o.environment === 'w' ? 'Windows' : (o.environment === 'l' ? 'Linux' : (o.environment === 'm' ? 'Mac' : 'Unknown')));
    d.uint8('is_private', o => o.is_private ? true : false);
    d.uint8('is_mod', o => o.is_mod ? true : false);
    if (d.output.mod) {
        d.nullString('link');
        d.nullString('downloaded_link');
        d.bytes('null', 1);
        d.uint32le('version');
        d.uint32le('size');
        d.uint8('type');
        d.uint8('dll');
    }
    d.uint8('is_secured', o => o.is_secured ? true : false);
    d.uint8('bots_num');
    return d.get();
}

function A2S_INFO(d) {
    d.uint8('protocol');
    d.nullString('name');
    d.nullString('map');
    d.nullString('folder');
    d.nullString('game');
    d.uint16le('app_id');
    d.uint8('players_num');
    d.uint8('players_max');
    d.uint8('bots_num');
    d.string('server_type', () => 1, o => o.server_type === 'd' ? 'Dedicated' : (o.server_type === 'l' ? 'LAN' : (o.server_type === 'p' ? 'Proxy' : 'Unknown')));
    d.string('environment', () => 1, o => o.environment === 'w' ? 'Windows' : (o.environment === 'l' ? 'Linux' : (o.environment === 'm' ? 'Mac' : 'Unknown')));
    d.uint8('is_private', o => o.is_private ? true : false);
    d.uint8('is_secured', o => o.is_secured ? true : false);
    if (d.output.app_id === 2400) {
        d.uint8('ship_mode', o => {
            switch(o.ship_mode) {
                case 0: return 'Hunt';
                case 1: return 'Elimination';
                case 2: return 'Duel';
                case 3: return 'Deathmatch';
                case 4: return 'VIP Team';
                case 5: return 'Team Elimination';
            }
        });
        d.uint8('ship_witnesses');
        d.uint8('ship_duration');
    }
    d.nullString('version');
    d.uint8('edf');
    if (d.output.edf & 0x80) {
        d.uint16le('port');
    }
    if (d.output.edf & 0x10) {
        d.uint64le('steam_id');
    }
    if (d.output.edf & 0x40) {
        d.uint16le('tv_port');
        d.nullString('tv_name');
    }
    if (d.output.edf & 0x20) {
        d.nullString('keywords');
    }
    if (d.output.edf & 0x01) {
        d.uint64le('game_id');
    }
    return d.get();
}

function A2S_CHALLANGE(d) {
    d.bytes('challange', 4);
    return d.get();
}

function A2S_PLAYERS(d, app_id) {
    let players = [];

    d.uint8('players_num');
    for (let i = 0; i < d.output.players_num; i++) {
        d.uint8('index');
        d.nullString('name');
        d.uint32le('score');
        d.uint32le('duration'); // float, not uint32le!
        // if (app_id === 2400) {
        //     d.uint32le('deaths');
        //     d.uint32le('money');
        // }
        let { index, name, score, duration, deaths, money } = Object.assign({}, d.output);
        players.push({ index, name, score, duration, deaths, money });
    }

    return players;
}

function A2S_RULES(d) {
    let rules = [];

    d.uint16le('rules_num');
    for (let i = 0; i < d.output.rules_num; i++) {
        d.nullString('name');
        d.nullString('value');
        let { name, value } = d.output;
        rules[name] = value;
    }

    return rules;
}

export {
    A2S_INFO_OLD,
    A2S_INFO,
    A2S_CHALLANGE,
    A2S_PLAYERS,
    A2S_RULES,
}
