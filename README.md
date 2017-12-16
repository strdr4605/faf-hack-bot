# faf-hack-bot

Back-end side of ChatBot

1. `npm run start`: `node bin/dev`
2. `npm run nodemon`: `nodemon bin/dev`
3. `npm run clean`: `rm -rf dist`
4. `npm run build`: `npm run clean && mkdir dist && babel server -s -d dist`,
5. `npm run production`: `npm run build && node bin/production`
