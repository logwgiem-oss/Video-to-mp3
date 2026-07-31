const { createFFmpeg } = FFmpeg;

// Explicitly forces single-thread mode to bypass mobile browser security
const ffmpeg = createFFmpeg({ 
    corePath: "https://unpkg.com",
    log: true 
});

const startBtn = document.getElementById('start-btn');
const videoFile = document.getElementById('video-file');
const statusDiv = document.getElementById('status');
const downloadArea = document.getElementById('download-area');

async function init() {
    try {
        await ffmpeg.load();
        statusDiv.innerText = "Ready! Choose a video clip.";
        startBtn.disabled = false;
        startBtn.innerText = "Extract MP3 Audio";
    } catch (err) {
        statusDiv.innerText = "Loading failed. Please refresh.";
        console.error(err);
    }
}
init();

startBtn.addEventListener('click', async () => {
    if (!videoFile.files.length) return alert("Select a video first.");
    
    const file = videoFile.files[0];
    statusDiv.innerText = "Converting... (This takes a moment on mobile)";
    startBtn.disabled = true;
    downloadArea.innerHTML = "";

    // Load file into browser virtual memory
    const fileData = await file.arrayBuffer();
    ffmpeg.FS('writeFile', 'input', new Uint8Array(fileData));
    
    // Extract audio stream
    await ffmpeg.run('-i', 'input', '-vn', '-acodec', 'libmp3lame', '-ab', '192k', 'output.mp3');
    const data = ffmpeg.FS('readFile', 'output.mp3');

    const blob = new Blob([data.buffer], { type: 'audio/mp3' });
    const url = URL.createObjectURL(blob);

    const audio = document.createElement('audio');
    audio.src = url;
    audio.controls = true;
    audio.style.width = "100%";

    const link = document.createElement('a');
    link.href = url;
    link.download = "converted_audio.mp3";
    link.innerText = "⬇ *Download MP3 File*";
    link.style.display = "block";
    link.style.padding = "10px";
    link.style.background = "#28a745";
    link.style.color = "white";
    link.style.textDecoration = "none";
    link.style.borderRadius = "5px";
    link.style.marginTop = "10px";

    downloadArea.appendChild(audio);
    downloadArea.appendChild(link);
    statusDiv.innerText = "Done!";
    startBtn.disabled = false;
});

