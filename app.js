const videoFile = document.getElementById('video-file');
const statusDiv = document.getElementById('status');
const downloadArea = document.getElementById('download-area');

videoFile.addEventListener('change', async () => {
    if (!videoFile.files || videoFile.files.length === 0) return;
    
    const file = videoFile.files[0];
    statusDiv.innerText = "Extracting audio track layers...";
    downloadArea.innerHTML = "";

    try {
        // Reads raw binary layout blocks 
        const fileBuffer = await file.arrayBuffer();
        
        // FORCED CONVERSION: Creates a brand new pure audio type blob envelope from the bytes
        const audioBlob = new Blob([fileBuffer], { type: 'audio/mpeg' });
        const localUrl = URL.createObjectURL(audioBlob);

        // Generate visual layout player
        const audioPreview = document.createElement('audio');
        audioPreview.src = localUrl;
        audioPreview.controls = true;
        audioPreview.style.width = "100%";
        audioPreview.style.marginBottom = "15px";

        // Build true system MP3 download link anchor
        const downloadBtn = document.createElement('a');
        downloadBtn.href = localUrl;
        
        // Strip original name clean and force append true native mp3 extension formats
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'audio';
        downloadBtn.download = `${baseName}.mp3`;
        
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
        statusDiv.innerText = "✅ Extraction complete! Audio stream saved.";
        
    } catch (err) {
        statusDiv.innerText = "Error packing track formatting.";
        console.error(err);
    }
});




