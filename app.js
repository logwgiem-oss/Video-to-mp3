const startBtn = document.getElementById('start-btn');
const videoFile = document.getElementById('video-file');
const statusDiv = document.getElementById('status');
const downloadArea = document.getElementById('download-area');

startBtn.addEventListener('click', async () => {
    // FIX 1: Make sure a video is picked and readable
    if (!videoFile.files || videoFile.files.length === 0) {
        return alert("Please pick a video file from your phone gallery first.");
    }
    
    // FIX 2: Target the single file index [0] to extract data, not the whole system list object
    const file = videoFile.files[0];
    statusDiv.innerText = "Decompressing video stream tracks...";
    startBtn.disabled = true;
    downloadArea.innerHTML = "";

    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
        }

        // Reads the single raw video data track cleanly into memory
        const fileBuffer = await file.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(fileBuffer);

        statusDiv.innerText = "Encoding tracks into real MP3 format... (Keep this tab active)";

        const channels = Math.min(audioBuffer.numberOfChannels, 2);
        const sampleRate = audioBuffer.sampleRate;
        const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, 192); // Crisp 192kbps Quality
        
        const mp3Data = [];
        const sampleBlockSize = 1152;

        const leftChannel = audioBuffer.getChannelData(0);
        const rightChannel = channels > 1 ? audioBuffer.getChannelData(1) : leftChannel;

        for (let i = 0; i < leftChannel.length; i += sampleBlockSize) {
            const leftChunk = new Int16Array(Math.min(sampleBlockSize, leftChannel.length - i));
            const rightChunk = new Int16Array(Math.min(sampleBlockSize, rightChannel.length - i));

            for (let j = 0; j < leftChunk.length; j++) {
                leftChunk[j] = leftChannel[i + j] < 0 ? leftChannel[i + j] * 0x8000 : leftChannel[i + j] * 0x7FFF;
                rightChunk[j] = rightChannel[i + j] < 0 ? rightChannel[i + j] * 0x8000 : rightChannel[i + j] * 0x7FFF;
            }

            let mp3buf;
            if (channels === 2) {
                mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
            } else {
                mp3buf = mp3encoder.encodeBuffer(leftChunk);
            }
            if (mp3buf.length > 0) mp3Data.push(new Uint8Array(mp3buf));
        }

        const endBuf = mp3encoder.flush();
        if (endBuf.length > 0) mp3Data.push(new Uint8Array(endBuf));

        const mp3Blob = new Blob(mp3Data, { type: 'audio/mp3' });
        const localUrl = URL.createObjectURL(mp3Blob);

        const audioPreview = document.createElement('audio');
        audioPreview.src = localUrl;
        audioPreview.controls = true;
        audioPreview.style.width = "100%";
        audioPreview.style.marginBottom = "15px";

        const downloadBtn = document.createElement('a');
        downloadBtn.href = localUrl;
        
        // Clear old extension strings out before mapping .mp3
        const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || 'extracted_audio';
        downloadBtn.download = `${cleanName}.mp3`;
        
        downloadBtn.innerText = "💾 Save True MP3 File";
        downloadBtn.style.display = "block";
        downloadBtn.style.padding = "12px";
        downloadBtn.style.background = "#22c55e";
        downloadBtn.style.color = "white";
        downloadBtn.style.textDecoration = "none";
        downloadBtn.style.borderRadius = "6px";
        downloadBtn.style.fontWeight = "bold";

        downloadArea.appendChild(audioPreview);
        downloadArea.appendChild(downloadBtn);
        statusDiv.innerText = "✅ Transcoding Complete!";
        audioCtx.close();

    } catch (err) {
        statusDiv.innerText = "Conversion error. Please use a shorter video track clip.";
        console.error(err);
    } finally {
        startBtn.disabled = false;
    }
});








