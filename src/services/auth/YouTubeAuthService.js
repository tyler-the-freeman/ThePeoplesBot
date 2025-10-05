import express from 'express';
import session from 'express-session';
import { google } from 'googleapis';
import crypto from 'crypto';
import * as OAuthClientInfo from '../../../client_secret.json' with { type: 'json' };

// Failed attempt at interactive OAuth2 authentication

const scopes = [
    'https://www.googleapis.com/auth/youtube.readonly',
];

const app = express();
const port = 8080;

const OAuth2Client = new google.auth.OAuth2({
    clientId: OAuthClientInfo.default.clientId,
    clientSecret: OAuthClientInfo.default.clientSecret,
    redirectUri: 'http://localhost:8080/oauth2callback'
});

let globalToken;

const secret = crypto.randomBytes(32).toString('hex');
app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
}));

app.get('/', (req, res) => {
    const state = req.session.state;

    res.send(req.session.tokens || 'You are not authenticated. <a href="/auth">Login with YouTube</a>');
});

app.get('/auth', (req, res) => {
    const state = crypto.randomBytes(16).toString('hex');
    req.session.state = state; // Store the state in the session

    const authUrl = OAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        state: state
    });
    res.redirect(authUrl);
});

app.get('/oauth2callback', async (req, res) => {
    const state = req.session.state;
    const code = req.query.code;

    try {
        const { tokens } = await OAuth2Client.getToken(code);
        globalToken = tokens;
        req.session.tokens = tokens; // Store tokens in session
        res.redirect('/');
    } catch (error) {
        console.error('Error during OAuth2 callback:', error);
        res.status(500).send('Authentication failed');
    }
});

app.get('/youtube-data', async (req, res) => {
    if (!req.session.tokens){
        return res.status(401).send('You are not authenticated. <a href="/auth">Login with YouTube</a>');
    }

    OAuth2Client.setCredentials(req.session.tokens);
    const youtube = google.youtube({
        version: 'v3',
        auth: OAuth2Client
    });

    try {
        const response = await youtube.channels.list({
            part: 'snippet,contentDetails,statistics',
            mine: true
        });

        if (response.data.items.length > 0) {
            res.json(response.data.items[0]);
        } else {
            res.status(404).send('No YouTube channel found for the authenticated user.');
        }
    } catch (error) {
        console.error('Error fetching YouTube data:', error);
        res.status(500).send('Failed to fetch YouTube data');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

export function getGlobalClient() {
    return OAuth2Client;
}