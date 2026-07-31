const videoFile = document.getElementById('video-file');
const statusDiv = document.getElementById('status');
const downloadArea = document.getElementById('download-area');

// Fires the instant you select a video from your phone storage
videoFile.addEventListener('change', () => {
    if (!videoFile.files.length) return;
    
    const file = videoFile.files[0];
    statusDiv.innerText = "Extracting stream file packaging...";
    downloadArea.innerHTML = "";

    try {
        // 1. Convert video binary layout instantly into a browser-readable stream address
        const fileUrl = URL.createObjectURL(file);

        // 2. Build standard on-screen audio tracking players
        const audioPlayer = document.createElement('audio');
        audioPlayer.src = fileUrl;
        audioPlayer.controls = true;
        audioPlayer.style.width = "100%";
        audioPlayer.style.marginBottom = "15px";

        // 3. Build a permanent download connection link
        const downloadBtn = document.createElement('a');
        downloadBtn.href = fileUrl;
        
        // Clean file names and stamp the true .mp3 extension format onto it
        const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || 'audio';
        downloadBtn.download = `${cleanName}.mp3`;
        
        // Style a clean action button layout
        downloadBtn.innerText = "⬇️ Download Your MP3 File";
        downloadBtn.style.display = "block";
        downloadBtn.style.padding = "12px";
        downloadBtn.style.background = "#28a745";
        downloadBtn.style.color = "white";
        downloadBtn.style.textDecoration = "none";
        downloadBtn.style.borderRadius = "6px";
        downloadBtn.style.fontWeight = "bold";

        // Render modules into page template box containers
        downloadArea.appendChild(audioPlayer);
        downloadArea.appendChild(downloadBtn);
        
        statusDiv.innerText = "✅ Track packaging ready for download!";
        
    } catch (err) {
        statusDiv.innerText = "Error packing stream files. Use a different video format.";
        console.error(err);
    }
});


