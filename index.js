const app = require('express')();
const { createWriteStream } = require('fs');
const Spotify = require('spotify-web-api-node');
const ytdl = require('ytdl-core');
const { search } = require('yt-search');

const categories = [{ id: 'toplists', name: 'Top Lists' },
{ id: '0JQ5DAqbMKFzHmL4tf05da', name: 'Mood' },
{ id: '0JQ5DAqbMKFEC4WFtoNRpw', name: 'Pop' },
{ id: '0JQ5DAqbMKFQ00XGBls6ym', name: 'Hip-Hop' },
{ id: '0JQ5DAqbMKFHOzuVTgTizF', name: 'Dance/Electronic' },
{ id: '0JQ5DAqbMKFIVNxQgRNSg0', name: 'Decades' },
{ id: '0JQ5DAqbMKFCfObibaOZbv', name: 'Gaming' },
{ id: '0JQ5DAqbMKFLb2EqgLtpjC', name: 'Wellness' },
{ id: '0JQ5DAqbMKFPw634sFwguI', name: 'EQUAL' },
{ id: '0JQ5DAqbMKFFzDl7qN9Apr', name: 'Chill' },
{ id: '0JQ5DAqbMKFAXlCG6QvYQ4', name: 'Workout' },
{ id: '0JQ5DAqbMKFDXXwE9BDJAr', name: 'Rock' },
{ id: '0JQ5DAqbMKFA6SOHvT3gck', name: 'Party' },
{ id: '0JQ5DAqbMKFCbimwdOYlsl', name: 'Focus' },
{ id: '0JQ5DAqbMKFCuoRTxhYWow', name: 'Sleep' },
{ id: '0JQ5DAqbMKFRY5ok2pxXJ0', name: 'Cooking & Dining' },
{ id: '0JQ5DAqbMKFAJ5xb0fwo9m', name: 'Jazz' },
{ id: '0JQ5DAqbMKFEZPnFQSFB1T', name: 'R&B' },
{ id: '0JQ5DAqbMKFAUsdyVjCQuL', name: 'Romance' },
{ id: '0JQ5DAqbMKFIpEuaCnimBj', name: 'Soul' },
{ id: '0JQ5DAqbMKFCWjUTdzaG0e', name: 'Indie' },
{ id: '0JQ5DAqbMKFPrEiAOxgac3', name: 'Classical' },
{ id: '0JQ5DAqbMKFx0uLQR2okcc', name: 'At Home' },
{ id: '0JQ5DAqbMKFDkd668ypn6O', name: 'Metal' },
{ id: '0JQ5DAqbMKFFoimhOqWzLB', name: 'Kids & Family' },
{ id: '0JQ5DAqbMKFxXaXKP7zcDp', name: 'Latin' },
{ id: '0JQ5DAqbMKFObNLOHydSW8', name: 'Caribbean' },
{ id: '0JQ5DAqbMKFQiK2EHwyjcU', name: 'Blues' },
{ id: '0JQ5DAqbMKFAjfauKLOZiv', name: 'Punk' },
{ id: '0JQ5DAqbMKFKLfwjuJMoNC', name: 'Country' },
{ id: '0JQ5DAqbMKFy78wprEpAjl', name: 'Folk & Acoustic' },
{ id: '0JQ5DAqbMKFNQ0fGp4byGU', name: 'Afro' },
{ id: '0JQ5DAqbMKFAQy4HL4XU2D', name: 'Travel' },
{ id: '0JQ5DAqbMKFRieVZLLoo9m', name: 'Instrumental' },
{ id: '0JQ5DAqbMKFGvOw3O4nLAf', name: 'K-Pop' },
{ id: '0JQ5DAqbMKFLjmiZRss79w', name: 'Ambient' },
{ id: '0JQ5DAqbMKFF1br7dZcRtK', name: 'Pride' },
{ id: '0JQ5DAqbMKFLVaM30PMBm4', name: 'Summer' }]

const api = new Spotify({
    clientId: 'fdddbaf4de844274a0e20ed6f11a45dd',
    clientSecret: 'd25b808d48da4bcf88ed309770f49ab7',
    redirectUri: 'http://localhost:3000/callback'
});
const excode = 'BQDFEog7hIUcmYcbUB3HL5V7-tz4VJVTexdUufyjwjh3h8tBFmflPJi2X9VXHO_HOZ0vOJiRitWXnuLwmrqXSBk0xxaNwQ7Bq8wiTrdWYvin2BqThncUObK3DipIEox_uhHMRn_3eTgZJ_ksSeuwpddM-SzDiuo0xVxOv6mBuFHQZkGRxkcCB0qzY4iT6Qs_XhA1EmtXUFhKpNHtu0lct6Vksg'

const formattrack = (res) => {
    return {
        name: res.name,
        duration: res.duration_ms,
        id: res.id,
        artist: res.artists[0].name,
        image: res.album.images[0].url
    };
};

const formatplaylist = (res) => {
    const tracks = [];
    res.tracks.items.forEach(el => {
        tracks.push(formattrack(el.track));
    });
    return {
        name: res.name,
        id: res.id,
        owner: res.owner.display_name,
        tracks: tracks,
        image: res.images[0].url
    };
};

const formatalbum = (res) => {
    const tracks = [];
    res.tracks.items.forEach(el => {
        tracks.push({//no image bcz all the same
            name: el.name,
            duration: el.duration_ms,
            id: el.id,
            artist: el.artists[0].name,
        });
    });
    return {
        name: res.name,
        id: res.id,
        artist: res.artists[0].name,
        tracks: tracks,
        image: res.images[0].url
    };
};

const formatlikedpls = (res) => {
    const pls = [];
    res.items.forEach(el => {
        pls.push({
            name: el.name,
            owner: el.owner.display_name,
            image: el.images[0].url,
            id: el.id
        });
    });
    return {
        pls: pls
    }
};

const formatusertrs = (res) => {
    const trs = [];
    res.items.forEach(el => {
        trs.push(formattrack(el.track));
    });
    return {
        trs: trs
    }
};

const formatuserals = (res) => {
    const als = [];
    res.items.forEach(el => {
        als.push(formatalbum(el.album));
    });
    return {
        als: als
    }
};

const formatsearch = (res) => {
    const trs = [];
    res.tracks.items.forEach(el => {
        trs.push(formattrack(el));
    });
    const pls = [];
    res.playlists.items.forEach(el => {
        pls.push({//                      !!!! NO TRACKS
            name: el.name,
            owner: el.owner.display_name,
            image: el.images[0].url,
            id: el.id
        });
    });
    const als = [];
    res.albums.items.forEach(el => {
        als.push({//                      !!!! NO TRACKS
            name: el.name,
            id: el.id,
            artist: el.artists[0].name,
            image: el.images[0].url
        });
    });
    return {
        tracks: trs,
        playlists: pls,
        albums: als
    }
}

const formatfeatured = (res) => {
    const pls = [];
    res.playlists.items.forEach(el => {
        pls.push({
            name: el.name,
            owner: el.owner.display_name,
            image: el.images[0].url,
            id: el.id
        });
    });
    return {
        pls: pls
    }
}



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
    const data = await api.search(term, ['track', 'playlist', 'album'], { limit: 50 });
    console.log(formatsearch(data.body));
    res.json(formatsearch(data.body));
});

app.get('/track/:id', async (req, res) => {
    api.setAccessToken(excode);
    const data = await api.getTrack(req.params.id);
    res.json(formattrack(data.body));
});

app.get('/playlist/:id', async (req, res) => {
    api.setAccessToken(excode);
    const data = await api.getPlaylist(req.params.id);
    res.json(formatplaylist(data.body));
});

app.get('/album/:id', async (req, res) => {
    api.setAccessToken(excode);
    const data = await api.getAlbum(req.params.id);
    res.json(formatalbum(data.body));
});

app.get('/userals', async (req, res) => {
    api.setAccessToken(excode);
    const data = await api.getMySavedAlbums({ limit: 50 });
    res.json(formatuserals(data.body));
});

app.get('/usertrs', async (req, res) => {//liked tracks
    api.setAccessToken(excode);
    const data = await api.getMySavedTracks({ limit: 50 });
    res.json(formatusertrs(data.body));
});

app.get('/userpls', async (req, res) => {//this has all the playlists(made + following)
    api.setAccessToken(excode);
    const data = await api.getUserPlaylists({ limit: 50 });
    res.json(formatlikedpls(data.body));
});

app.get('/featured', async (req, res) => {//featured playlists for GR
    api.setAccessToken(excode);
    const data = await api.getFeaturedPlaylists({ locale: 'GR', limit: 20 });
    res.json(data.body);
});

app.get('/categorypls', async (req, res) => {//get category playlists with above ready names and ids
    api.setAccessToken(excode);
    const final = [];
    const pls = [];
    for (let i = 0; i < categories.length; i++) {
        const cat = categories[i];
        const data = await api.getPlaylistsForCategory(cat.id, { limit: 20 });
        const playlists = data.body.playlists.items;
        final.push({ name: cat.name, pls: playlists });
    }
    res.json(pls);
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