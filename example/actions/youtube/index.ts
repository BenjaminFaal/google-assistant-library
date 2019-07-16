import ActionPackage from "../ActionPackage";
import Speaker from "speaker";
import {Decoder} from "lame";
import youtubeStream from "youtube-audio-stream";
import {google, youtube_v3} from "googleapis";

enum State {
    PLAYING,
    PAUSED,
    STOPPED
}

export default class YouTube extends ActionPackage {

    private state: State = State.STOPPED;
    private trackIndex = 0;
    private queue: youtube_v3.Schema$SearchResult[];

    private stream: NodeJS.WriteStream;
    private speaker = new Speaker();
    private api: youtube_v3.Youtube;

    constructor() {
        super('YouTube', 'com.youtube', 'MEDIA');
    }

    initialize(config: any) {
        this.api = google.youtube({version: 'v3', auth: config.apiKey});

        this.addCommand(
            'Play',
            ['play $SchemaOrg_Text:query on youtube'],
            [{name: 'query', type: 'SchemaOrg_Text'}],
            ['Playing $query on YouTube'],
            params => {
                this.api.search.list({
                    type: 'video',
                    part: 'snippet',
                    q: params.query,
                    maxResults: config.maxResults || 10
                }).then(res => res.data.items).then(items => {
                    this.queue = items;
                    this.trackIndex = 0;

                    this.play(this.queue[this.trackIndex].id.videoId);
                });
            });

        this.addCommand(
            'Pause',
            ['pause youtube'],
            [],
            ['Pausing YouTube'],
            this.pause.bind(this)
        );

        this.addCommand(
            'Resume',
            ['resume youtube'],
            [],
            ['Resuming YouTube'],
            this.resume.bind(this)
        );

        this.addCommand(
            'Stop',
            ['stop youtube'],
            [],
            ['Stopping YouTube'],
            this.stop.bind(this)
        );

        this.addCommand(
            'Next',
            ['next youtube'],
            [],
            ['Playing next track on YouTube'],
            this.offsetQueue.bind(this, 1)
        );

        this.addCommand(
            'Previous',
            ['previous youtube'],
            [],
            ['Playing previous track on YouTube'],
            this.offsetQueue.bind(this, -1)
        );
    }

    private offsetQueue(offset: number) {
        this.trackIndex += offset;
        if (this.trackIndex >= this.queue.length) {
            this.trackIndex = 0;
        } else if (this.trackIndex < 0) {
            this.trackIndex = this.queue.length - 1;
        }

        this.play(this.queue[this.trackIndex].id.videoId);
    }

    private play(videoId: string) {
        this.stop();

        this.stream = youtubeStream(videoId)
            .pipe(new Decoder());
        this.stream.pipe(this.speaker);

        this.state = State.PLAYING;
    }

    private pause() {
        if (this.state === State.PLAYING) {
            this.stream.unpipe(this.speaker);

            this.state = State.PAUSED;
        }
    }

    private resume() {
        if (this.state === State.PAUSED) {
            this.stream.pipe(this.speaker);

            this.state = State.PLAYING;
        }
    }

    private stop() {
        if (this.stream) {
            this.stream.unpipe(this.speaker);
            this.stream = null;

            this.state = State.STOPPED;
        }
    }

}