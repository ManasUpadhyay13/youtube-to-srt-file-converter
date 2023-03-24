const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs')
const YouTubeMp3Downloader = require("youtube-mp3-downloader")
const { Deepgram } = require('@deepgram/sdk')
const ffmpeg = require('ffmpeg-static')



app.use(express.json())
app.use(cors())



app.post("/", (req, res) => {
    const video_id = req.query.video_id
    console.log(video_id);

    try {
        const deepgram_key = 'c91ad957ad0c09831cc1c0fc57fa3348fb6ba285'
        const deepgram = new Deepgram(deepgram_key)

        const YD = new YouTubeMp3Downloader({
            ffmpegPath: ffmpeg,
            outputPath: './audio/',
            youtubeVideoQuality: 'highestaudio'
        })

        YD.download(video_id)

        YD.on("finished", async (err, video) => {
            const videoFileName = video.file
            console.log("donwloading finished")
            const result = await deepgram.transcription.preRecorded(
                { buffer: fs.readFileSync(videoFileName), mimetype: "audio/mp3" },
                { punctuate: true, utterances: true }
            )
            fs.writeFileSync(videoFileName + '.txt', result.toWebVTT() )
            res.send("successfully created the srt file.")
        })
    } catch (error) {
        res.send(error.message)
    }

})


app.listen(8080, () => {
    console.log("listening on port 8080")
})