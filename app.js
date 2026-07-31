const { createFFmpeg } = FFmpeg;

// Use precise v0.11.0 links to guarantee the background worker boots correctly
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
        statusDiv.innerText = "Configuring multimedia framework...";
        await ffmpeg.load();
        statusDiv.innerText = "Ready! Choose a video clip.";
        startBtn.disabled = false;
        startBtn.innerText = "Extract MP3 Audio";
    } catch (err) {
        statusDiv.innerText = "Load failed. Please try a different browser or reload.";
        console.error(err);
    }
}
init();

startBtn.addEventListener('click', async () => {
    if (!videoFile.files.length) return alert("Select a video first.");
    
    const file = videoFile.files[0];
    statusDiv.innerText = "Converting video tracks... please wait.";
    startBtn.disabled = true;
    downloadArea.innerHTML = "";

    // Read the user's video file data securely
    const fileData = await file.arrayBuffer();
    ffmpeg.FS('writeFile', 'input', new Uint8Array(fileData));
    
    // Process audio track conversion
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
    link.innerText = "Download MP3";
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
