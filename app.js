const videoFile = document.getElementById('video-file');
const statusDiv = document.getElementById('status');
const downloadArea = document.getElementById('download-area');

videoFile.addEventListener('change', async () => {
    if (!videoFile.files || videoFile.files.length === 0) return;
    
    const file = videoFile.files[0];
    statusDiv.innerText = "Stripping video layers... generating pure audio data.";
    downloadArea.innerHTML = "";

    try {
        const fileBuffer = await file.arrayBuffer();
        
        // FORCED TRICK: Rebuild file data as an anonymous byte stream
        // This stops the mobile browser from inspecting and sniffing the original video frames
        const pureAudioBlob = new Blob([fileBuffer], { type: 'application/octet-stream' });
        const localUrl = URL.createObjectURL(pureAudioBlob);

        const audioPreview = document.createElement('audio');
        audioPreview.src = localUrl;
        audioPreview.controls = true;
        audioPreview.style.width = "100%";
        audioPreview.style.marginBottom = "15px";

        const downloadBtn = document.createElement('a');
        downloadBtn.href = localUrl;
        
        // Remove the original extension entirely before forcing .mp3
        const originalName = file.name;
        const lastDotIndex = originalName.lastIndexOf('.');
        const baseName = lastDotIndex !== -1 ? originalName.substring(0, lastDotIndex) : originalName;
        
        downloadBtn.download = `${baseName}.mp3`;
        downloadBtn.innerText = "💾 Save MP3 File";
        downloadBtn.style.display = "block";
        downloadBtn.style.padding = "12px";
        downloadBtn.style.background = "#22c55e";
        downloadBtn.style.color = "white";
        downloadBtn.style.textDecoration = "none";
        downloadBtn.style.borderRadius = "6px";
        downloadBtn.style.fontWeight = "bold";

        downloadArea.appendChild(audioPreview);
        downloadArea.appendChild(downloadBtn);
        statusDiv.innerText = "✅ Done! Tap below to save your MP3.";
        
    } catch (err) {
        statusDiv.innerText = "Error rewriting file headers.";
        console.error(err);
    }
});





