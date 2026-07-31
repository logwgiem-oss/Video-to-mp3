const startBtn = document.getElementById('start-btn');
const videoFile = document.getElementById('video-file');
const statusDiv = document.getElementById('status');
const downloadArea = document.getElementById('download-area');

startBtn.addEventListener('click', async () => {
    if (!videoFile.files.length) return alert("Please select a video file first.");
    
    const file = videoFile.files[0]; // Correctly targets the selected file object
    statusDiv.innerText = "Processing video stream...";
    startBtn.disabled = true;
    downloadArea.innerHTML = "";

    try {
        // 1. Create a temporary video playback node to extract audio streams
        const videoElement = document.createElement('video');
        videoElement.src = URL.createObjectURL(file);
        videoElement.muted = true;
        videoElement.playsInline = true;

        // 2. Wake up mobile audio layers
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
        }

        // 3. Listen for video metadata loading to begin reading channels
        videoElement.onloadedmetadata = async () => {
            statusDiv.innerText = "Extracting sound channels...";
            
            // Connect video streams directly to browser hardware nodes
            const source = audioCtx.createMediaElementSource(videoElement);
            const destination = audioCtx.createMediaStreamDestination();
            source.connect(destination);

            // Record the pure audio output track data
            const mediaRecorder = new MediaRecorder(destination.stream);
            const chunks = [];

            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorder.onstop = () => {
                // Compile the captured raw audio into a playable, downloadable track
                const audioBlob = new Blob(chunks, { type: 'audio/mp3' });
                const localUrl = URL.createObjectURL(audioBlob);

                const audioPreview = document.createElement('audio');
                audioPreview.src = localUrl;
                audioPreview.controls = true;
                audioPreview.style.width = "100%";
                audioPreview.style.marginBottom = "15px";

                const downloadBtn = document.createElement('a');
                downloadBtn.href = localUrl;
                downloadBtn.download = `${file.name.substring(0, file.name.lastIndexOf('.')) || 'audio'}.mp3`;
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
                startBtn.disabled = false;
            };

            // Fast playback extraction loops
            mediaRecorder.start();
            videoElement.play();
            
            videoElement.onended = () => {
                mediaRecorder.stop();
                audioCtx.close();
            };
        };
    } catch (err) {
        statusDiv.innerText = "Error tracking audio stream.";
        console.error(err);
        startBtn.disabled = false;
    }
});

