const { createFFmpeg } = FFmpeg;

// Explicitly link both the driver script AND the backend webassembly file manually 
const ffmpeg = createFFmpeg({ 
    corePath: "https://unpkg.com",
    log: true 
});

const startBtn = document.getElementById('start-btn');
const videoFile = document.getElementById('video-file');
const statusDiv = document.getElementById('status');
const downloadArea = document.getElementById('download-area');

async function initializeApp() {
    try {
        statusDiv.innerText = "Syncing media cores...";
        await ffmpeg.load();
        statusDiv.innerText = "Ready! Choose a video track.";
        startBtn.disabled = false;
        startBtn.innerText = "Convert Video to MP3";
    } catch (err) {
        statusDiv.innerText = "Engine blocked by browser configuration. Try using Chrome or a new browser tab.";
        console.error(err);
    }
}
initializeApp();

startBtn.addEventListener('click', async () => {
    if (!videoFile.files.length) return alert("Please select a video file from your phone storage.");
    
    const file = videoFile.files[0];
    statusDiv.innerText = "Extracting audio layers... (Keep this tab open)";
    startBtn.disabled = true;
    downloadArea.innerHTML = "";

    // Read local file memory blocks directly into the isolated sandbox
    const buffer = await file.arrayBuffer();
    ffmpeg.FS('writeFile', 'input_file', new Uint8Array(buffer));
    
    // Process stream conversion command
    await ffmpeg.run('-i', 'input_file', '-vn', '-acodec', 'libmp3lame', '-ab', '192k', 'output_file.mp3');
    const rawData = ffmpeg.FS('readFile', 'output_file.mp3');

    // Package the raw transcode array into an offline download link
    const mp3Blob = new Blob([rawData.buffer], { type: 'audio/mp3' });
    const localUrl = URL.createObjectURL(mp3Blob);

    const audioPreview = document.createElement('audio');
    audioPreview.src = localUrl;
    audioPreview.controls = true;
    audioPreview.style.width = "100%";

    const downloadBtn = document.createElement('a');
    downloadBtn.href = localUrl;
    downloadBtn.download = `${file.name.split('.')[0] || 'audio'}.mp3`;
    downloadBtn.innerText = "💾 Save MP3 File";
    downloadBtn.style.display = "block";
    downloadBtn.style.padding = "12px";
    downloadBtn.style.background = "#22c55e";
    downloadBtn.style.color = "white";
    downloadBtn.style.textDecoration = "none";
    downloadBtn.style.borderRadius = "6px";
    downloadBtn.style.fontWeight = "bold";
    downloadBtn.style.marginTop = "12px";

    downloadArea.appendChild(audioPreview);
    downloadArea.appendChild(downloadBtn);
    statusDiv.innerText = "Conversion Successful!";
    startBtn.disabled = false;

    // Flush memory addresses
    ffmpeg.FS('unlink', 'input_file');
    ffmpeg.FS('unlink', 'output_file.mp3');
});
