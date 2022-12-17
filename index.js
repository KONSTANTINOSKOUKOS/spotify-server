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
const excode = 'BQCG0tc5lFSgTVTmLZ0caKqMayTM0iPtcYPPijFXhl8qP_9PtbUF9MCAmRGJZAf95xjsbszNnsOE0qDEk34t_46Wp9GebQiYkeks0dKdzX4anE-tMeu64pTDVxmD_H1Otxf6jdGsoy-_Q6pcvisA9S7nz2Isb9UxOv1fOOv_TKhLVWtNbYOzm_6mhBRaEKZA_2vtxlVaMcl5UT5NnfHNuiPT0g'

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

app.get('/categorypls', async (req, res) => {//get category ids and then playlists
    api.setAccessToken(excode);
    const catsdata = await api.getCategories({ locale: 'GR', limit: 50 });
    console.log(catsdata);
    const cats = [];
    catsdata.body.categories.items.forEach(el => {
        cats.push({
            id: el.id,
            name: el.name
        });
    });
    const final = [];
    cats.forEach(async el => {
        const data = await api.getPlaylistsForCategory('0JQ5DAqbMKFQ00XGBls6ym');
        console.log(data);
        const pls = [];
        data.body.playlists.items.forEach(el => {
            pls.push({
                name: el.name,
                owner: el.owner.display_name,
                image: el.images[0].url,
                id: el.id
            });
        });
        final.push({
            name: el.name,
            id: el.id,
            pls: pls
        });
    });
    res.json(catsdata);
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
