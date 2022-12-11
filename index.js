const app = require('express')();
const { createWriteStream } = require('fs');
const Spotify = require('spotify-web-api-node');
const ytdl = require('ytdl-core');
const { search } = require('yt-search');

const api = new Spotify({
    clientId: 'fdddbaf4de844274a0e20ed6f11a45dd',
    clientSecret: 'd25b808d48da4bcf88ed309770f49ab7',
    redirectUri: 'http://localhost:3000/callback'
});
const excode = 'BQA-wHw7o1QpGimzm2jCIqGIEV6DW6JY5QmNUhDPyeEAFXQcTf9v9Pi4zRDThR9auee0xiWNwlm67nDejVwzl4YGXcXLnm5pHcFWXQeFMYOse_1uMRGW6xHnGLS6F8zICpT6U7xW6poW6EhHqu_BQf7scdcXt5npcFk-NsL5dafOdQFJvvlVpks8CzcP-dXpNodBaoNUIVgzvJxbk-y2FvKJvw'

app.get('/login', (req, res) => {
    res.redirect(api.createAuthorizeURL(['playlist-read-private', 'user-library-read', 'user-library-read'], 'state'));
});

app.get('/callback', (req, res) => {
    const code = req.query.code;
    const state = req.query.state;
    const error = req.query.error;

    if (error) {
        console.log('Callback Error:', error);
        res.send(`Callback Error: ${error}`);
        return;
    }

    api.authorizationCodeGrant(code).then(data => {
        const token = data.body.access_token;
        console.log(token);
        const refresh = data.body.refresh_token;
        const expire = data.body.expires_in;

        api.setAccessToken(token);
        api.setRefreshToken(refresh);

        console.log('got token!');
        res.send('authorized!');

        setInterval(async () => {
            const data = await api.refreshAccessToken(refresh);
            api.setAccessToken(data.body.access_token);
            console.log('token refrshed');
        }, expire / 2 * 1000);
    });
});

app.get('/search/:term', async (req, res) => {
    const term = req.params.term;
    api.setAccessToken(excode);
    const data = await api.search(term, ['track', 'playlist', 'album']);
    console.log(data.body);
    res.json(data.body);
});

app.get('/track/:id', async (req, res) => {
    api.setAccessToken(excode);
    const data = await api.getTrack(req.params.id);
    res.json(data.body);
});

app.get('/playlist/:id', async (req, res) => {
    api.setAccessToken(excode);
    const data = await api.getPlaylist(req.params.id);
    res.json(data.body);
});

app.get('/album/:id', async (req, res) => {
    api.setAccessToken(excode);
    const data = await api.getAlbum(req.params.id);
    res.json(data.body);
});

// app.get('/userpls', async (req, res) => {
//     api.setAccessToken(excode);
//     const data = await api.getUserPlaylists({ limit: 50 });
//     res.json(data.body);
// });

app.get('/userals', async (req, res) => {//
    api.setAccessToken(excode);
    const data = await api.getMySavedAlbums({ limit: 50 });
    res.json(data.body);
});

app.get('/usertrs', async (req, res) => {//liked tracks
    api.setAccessToken(excode);
    const data = await api.getMySavedTracks({ limit: 50 });
    res.json(data.body);
});

app.get('/likedpls', async (req, res) => {//this has all the playlists(made + following) not /userpls
    api.setAccessToken(excode);
    const data = await api.getUserPlaylists({ limit: 50 });
    res.json(data.body);
});

app.get('/download/:id', async (req, res) => {
    api.setAccessToken(excode);
    const data = await api.getTrack(req.params.id);
    const str = `${data.body.name}, ${data.body.artists[0].name}`;
    console.log(str);
    const ress = await search(str);
    const url = ress.videos[0].url;
    // res.send(ress.videos[0].url);
    ytdl(url, { format: 'highestaudio', filter: 'audioonly' })
        .pipe(createWriteStream('audio.mp3')).on('finish', () => {
            res.download('audio.mp3');
        });
    // res.end();
});

app.get('/', (req, res) => {
    res.send('spotify-server');
});
app.listen(3000, () => {
    console.log(`app running`);
});
