import {GetAccessTokenResponse} from "google-auth-library/build/src/auth/oauth2client";
import {JWTInput, OAuth2Client, UserRefreshClient} from "google-auth-library";
import * as fs from "fs";

const {installed: {client_id, client_secret}} = require('./client_secret.json');
const REFRESH_TOKEN_FILE = './refresh_token';

async function getAuthorizationCode(oAuth2Client): Promise<string> {
    const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/assistant-sdk-prototype',
    });

    console.log('Open the following url and login:', authorizeUrl);
    console.log('Enter code after logging in:');

    return new Promise((resolve => {
        process.openStdin().once('data', (data) => resolve(data.toString().trim()));
    }));
}

async function getRefreshToken(oAuth2Client) {
    const code = await getAuthorizationCode(oAuth2Client);
    const {tokens} = await oAuth2Client.getToken(code);
    return tokens.refresh_token;
}

async function getCredentials(): Promise<JWTInput> {
    const oAuth2Client = new OAuth2Client(
        client_id,
        client_secret,
        'urn:ietf:wg:oauth:2.0:oob',
    );
    const refresh_token = await getRefreshToken(oAuth2Client);
    return {
        type: 'authorized_user',
        client_id,
        client_secret,
        refresh_token,
    };
}

async function getAccessToken(): Promise<GetAccessTokenResponse> {
    var userRefreshClient = new UserRefreshClient();

    if (fs.existsSync(REFRESH_TOKEN_FILE)) {
        let refreshToken = fs.readFileSync(REFRESH_TOKEN_FILE).toString();
        userRefreshClient.fromJSON({
            type: 'authorized_user',
            client_id: client_id,
            client_secret: client_secret,
            refresh_token: refreshToken
        });
    } else {
        userRefreshClient.fromJSON(await getCredentials());
    }

    var accessTokenResponse = await userRefreshClient.getAccessToken();
    fs.writeFileSync(REFRESH_TOKEN_FILE, accessTokenResponse.res.data.refresh_token);
    return Promise.resolve(accessTokenResponse);
}

export default getAccessToken;