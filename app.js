const videoFile = document.getElementById('video-file');
const statusDiv = document.getElementById('status');
const downloadArea = document.getElementById('download-area');

videoFile.addEventListener('change', async () => {
    if (!videoFile.files.length) return;
    
    // Select the file from your phone storage
    const file = videoFile.files[0];
    statusDiv.innerText = "Processing video stream...";
    downloadArea.innerHTML = "";

    try {
        // 1. Create the binary media data link
        const localUrl = URL.createObjectURL(file);

        // 2. Generate a visual audio player on your screen
        const audioPreview = document.createElement('audio');
        audioPreview.src = localUrl;
        audioPreview.controls = true;
        audioPreview.style.width = "100%";
        audioPreview.style.marginBottom = "15px";
        downloadArea.appendChild(audioPreview);

        // 3. FORCE DOWNLOAD: Build an automated anchor link
        const downloadBtn = document.createElement('a');
        downloadBtn.href = localUrl;
        
        // Clean up the name and force the MP3 audio file type extension
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'audio';
        downloadBtn.download = `${baseName}.mp3`;
        
        // Style a big green fallback button in case the phone blocks auto-download
        downloadBtn.innerText = "⬇️ Tap Here if Download Didn't Start";
        downloadBtn.style.display = "block";
        downloadBtn.style.padding = "12px";
        downloadBtn.style.background = "#28a745";
        downloadBtn.style.color = "white";
        downloadBtn.style.textDecoration = "none";
        downloadBtn.style.borderRadius = "6px";
        downloadBtn.style.fontWeight = "bold";
        downloadArea.appendChild(downloadBtn);

        statusDiv.innerText = "⚡ Downloading file straight to your phone...";

        // 4. AUTOMATIC ACTION: Triggers the phone browser download prompt instantly
        downloadBtn.click(); 

    } catch (err) {
        statusDiv.innerText = "Error tracking audio stream formatting.";
        console.error(err);
    }
});

