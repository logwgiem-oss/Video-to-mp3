const startBtn = document.getElementById('start-btn');
const videoFile = document.getElementById('video-file');
const statusDiv = document.getElementById('status');
const downloadArea = document.getElementById('download-area');

startBtn.addEventListener('click', async () => {
    if (!videoFile.files.length) return alert("Please select a video file first.");
    
    const file = videoFile.files[0];
    statusDiv.innerText = "Processing audio track... please wait.";
    startBtn.disabled = true;
    downloadArea.innerHTML = "";

    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        
        const fileBuffer = await file.arrayBuffer();
        const decodedData = await audioCtx.decodeAudioData(fileBuffer);
        
        const audioBlob = bufferToWave(decodedData, decodedData.length);
        const localUrl = URL.createObjectURL(audioBlob);

        const audioPreview = document.createElement('audio');
        audioPreview.src = localUrl;
        audioPreview.controls = true;
        audioPreview.style.width = "100%";
        audioPreview.style.marginBottom = "15px";

        const downloadBtn = document.createElement('a');
        downloadBtn.href = localUrl;
        downloadBtn.download = `${file.name.substring(0, file.name.lastIndexOf('.')) || 'audio'}.wav`;
        downloadBtn.innerText = "⬇️ Download Audio File";
        downloadBtn.style.display = "block";
        downloadBtn.style.padding = "12px";
        downloadBtn.style.background = "#28a745";
        downloadBtn.style.color = "white";
        downloadBtn.style.textDecoration = "none";
        downloadBtn.style.borderRadius = "6px";
        downloadBtn.style.fontWeight = "bold";

        downloadArea.appendChild(audioPreview);
        downloadArea.appendChild(downloadBtn);
        statusDiv.innerText = "Extraction successful!";
    } catch (err) {
        statusDiv.innerText = "Error reading track. Make sure it's a valid video file.";
        console.error(err);
    } finally {
        startBtn.disabled = false;
    }
});

function bufferToWave(abuffer, len) {
    let numOfChan = abuffer.numberOfChannels,
        length = len * numOfChan * 2 + 44,
        buffer = new ArrayBuffer(length),
        view = new DataView(buffer),
        channels = [], i, sample,
        offset = 0,
        pos = 0;

    function setUint16(data) { view.setUint16(pos, data, true); pos += 2; }
    function setUint32(data) { view.setUint32(pos, data, true); pos += 4; }

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16);         // length = 16
    setUint16(1);          // PCM uncompressed
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // byte rate
    setUint16(numOfChan * 2);                      // block align
    setUint16(16);                                 // bits per sample
    setUint32(0x61746164);                         // "data" chunk
    setUint32(length - pos - 4);                   // chunk length

    for(i = 0; i < abuffer.numberOfChannels; i++) channels.push(abuffer.getChannelData(i));

    while(pos < length) {
        for(i = 0; i < numOfChan; i++) {
            sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }
    return new Blob([buffer], {type: "audio/wav"});
}

