function calculateTime() 
{
    const fileSize = parseFloat(document.getElementById('fileSize').value);
    const fileSizeUnit = document.getElementById('fileSizeUnit').value;
    const downloadSpeed = parseFloat(document.getElementById('downloadSpeed').value);
    const speedUnit = document.getElementById('speedUnit').value;
    
    // Validate inputs
    if (isNaN(fileSize) || isNaN(downloadSpeed) || fileSize <= 0 || downloadSpeed <= 0) 
    {
        alert("Please enter valid positive numbers for file size and download speed.");
        return;
    }
    
    // Convert file size to bytes
    let fileSizeBytes;
    switch (fileSizeUnit) 
    {
        case 'Bits': fileSizeBytes = fileSize / 8; break;
        case 'Bytes': fileSizeBytes = fileSize; break;
        case 'KB': fileSizeBytes = fileSize * 1024; break;
        case 'MB': fileSizeBytes = fileSize * 1024 * 1024; break;
        case 'GB': fileSizeBytes = fileSize * 1024 * 1024 * 1024; break;
        case 'TB': fileSizeBytes = fileSize * 1024 * 1024 * 1024 * 1024; break;
        case 'PB': fileSizeBytes = fileSize * 1024 * 1024 * 1024 * 1024 * 1024; break;
    }
    
    // Convert speed to bytes per second
    let speedBps;
    switch (speedUnit) 
    {
        case 'Bits': speedBps = downloadSpeed / 8; break;
        case 'Bytes': speedBps = downloadSpeed; break;
        case 'Kbps': speedBps = (downloadSpeed * 1000) / 8; break;
        case 'KBps': speedBps = downloadSpeed * 1024; break;
        case 'Mbps': speedBps = (downloadSpeed * 1000000) / 8; break;
        case 'MBps': speedBps = downloadSpeed * 1024 * 1024; break;
        case 'Gbps': speedBps = (downloadSpeed * 1000000000) / 8; break;
        case 'GBps': speedBps = downloadSpeed * 1024 * 1024 * 1024; break;
        case 'Tbps': speedBps = (downloadSpeed * 1000000000000) / 8; break;
        case 'TBps': speedBps = downloadSpeed * 1024 * 1024 * 1024 * 1024; break;
        case 'Pbps': speedBps = (downloadSpeed * 1000000000000000) / 8; break;
        case 'PBps': speedBps = downloadSpeed * 1024 * 1024 * 1024 * 1024 * 1024; break;
    }
    
    // Calculate time in seconds
    const totalSeconds = fileSizeBytes / speedBps;
    
    // Format time in words
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    
    let wordFormat = "";
    if (days > 0) wordFormat += days + (days === 1 ? " day " : " days ");
    if (hours > 0) wordFormat += hours + (hours === 1 ? " hour " : " hours ");
    if (minutes > 0) wordFormat += minutes + (minutes === 1 ? " minute " : " minutes ");
    if (seconds > 0 || wordFormat === "") wordFormat += seconds + (seconds === 1 ? " second" : " seconds");
    
    // Format time as DD:HH:MM:SS
    const timeFormat = 
        (days < 10 ? "0" + days : days) + ":" +
        (hours < 10 ? "0" + hours : hours) + ":" +
        (minutes < 10 ? "0" + minutes : minutes) + ":" +
        (seconds < 10 ? "0" + seconds : seconds);
    
    // Display results
    document.getElementById('wordFormat').textContent = wordFormat.trim();
    document.getElementById('timeFormat').textContent = timeFormat;
}