## Usage

```js
import { SourceQuery } from '@gramyhostujemy/query';

const query = new SourceQuery('91.224.117.164', 27015);
const info = await query.getInfo();
const players = await query.getPlayers();
const rules = await query.getRules();

console.log(info, players, rules);
```