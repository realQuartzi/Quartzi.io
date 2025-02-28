let abortController;
let searching = false;
let matchCount = 0;
let currentBranch = "";

function toggleSearch() 
{
    if (searching) 
    {
        if (abortController) 
        {
            abortController.abort();
        }
        resetSearchState();
    } 
    else 
    {
        startSearch();
    }
}

function startSearch() 
{
    if (abortController) 
    {
        abortController.abort();
    }

    abortController = new AbortController();
    document.getElementById("searchButton").textContent = "Cancel";
    searching = true;
    matchCount = 0;
    searchRepo(abortController.signal);
}

function resetSearchState() 
{
    document.getElementById("searchButton").textContent = "Search";
    searching = false;
}

async function getDefaultBranch(repoPath, signal) 
{
    const repoApiUrl = `https://api.github.com/repos/${repoPath}`;
    try 
    {
        const response = await fetch(repoApiUrl, { signal });
        const data = await response.json();
        return data.default_branch || "main";
    } 
    catch (error) 
    {
        return "main";
    }
}

async function searchRepo(signal) 
{
    const repoUrl = document.getElementById('repoUrl').value;
    const directory = document.getElementById('directory').value.trim();
    const searchText = document.getElementById('searchText').value;
    const fileExtensions = document.getElementById('fileExtensions').value.trim().split(/[,\s]+/).filter(ext => ext);

    const resultsDiv = document.getElementById('results');
    const progressDiv = document.getElementById('progress');
    const summaryDiv = document.getElementById('summary');

    resultsDiv.innerHTML = "";
    progressDiv.innerHTML = "Starting search...";
    summaryDiv.innerHTML = "";
    
    if (!repoUrl || !searchText) 
    {
        resultsDiv.innerHTML = "Please enter both the repository URL and search text.";
        resetSearchState();
        return;
    }
    
    const repoPath = repoUrl.replace("https://github.com/", "").replace(".git", "");
    currentBranch = await getDefaultBranch(repoPath, signal);
    const apiUrl = `https://api.github.com/repos/${repoPath}/git/trees/${currentBranch}?recursive=1`;
    
    try 
    {
        const response = await fetch(apiUrl, { signal });
        const data = await response.json();
        
        if (!data.tree) 
        {
            resultsDiv.innerHTML = "Error fetching repository contents. Check the URL.";
            resetSearchState();
            return;
        }
        
        let filteredFiles = data.tree.filter(file => 
        {
            if (file.type !== "blob") return false;
            if (directory && !file.path.startsWith(directory)) return false;
            if (fileExtensions.length > 0 && !fileExtensions.some(ext => file.path.endsWith('.' + ext))) return false;

            return true;
        });
        
        let totalFiles = filteredFiles.length;
        let processedFiles = 0;
        
        for (let file of filteredFiles) 
        {
            if (signal.aborted) return;

            let fileContent = await fetchFileContent(repoPath, currentBranch, file.path, signal);
            let lines = fileContent.split('\n');
            
            lines.forEach((line, index) => 
            {
                if (line.includes(searchText)) 
                {
                    matchCount++;
                    let fileUrl = `https://github.com/${repoPath}/blob/${currentBranch}/${file.path}`;
                    let matchElement = document.createElement("div");
                    matchElement.className = "result-item";
                    matchElement.innerHTML = 
                    `<a href="${fileUrl}" target="_blank" class="file-link">${file.path}</a>
                    <p>[Line ${index + 1}]: ${line}</p>`;
                    resultsDiv.appendChild(matchElement);
                }
            });
            
            processedFiles++;
            progressDiv.innerHTML = `Searching... ${processedFiles} of ${totalFiles} files processed.`;
            summaryDiv.innerHTML = `Branch: ${currentBranch} | Matches Found: ${matchCount}`;
        }
        
        progressDiv.innerHTML = "Search complete.";
        resetSearchState();
    } 
    catch (error) 
    {
        if (error.name !== 'AbortError') 
        {
            resultsDiv.innerHTML = "Error: " + error.message;
            resetSearchState();
        }
    }
}

async function fetchFileContent(repoPath, branch, filePath, signal) 
{
    const fileUrl = `https://raw.githubusercontent.com/${repoPath}/${branch}/${filePath}`;
    const response = await fetch(fileUrl, { signal });
    return await response.text();
}