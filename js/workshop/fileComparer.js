let fileContents = [null, null];
let fileLoaded = [false, false];

function loadFile(event, index) 
{
    const reader = new FileReader();
    reader.onload = function(e) 
    {
        fileContents[index] = e.target.result;
        fileLoaded[index] = true;
    };

    reader.readAsText(event.target.files[0]);
}

function clearResults(resultID, progressID) 
{
    document.getElementById(resultID).innerHTML = "";

    const progressElement = document.getElementById(progressID);
    progressElement.textContent = "Ready for a new comparison.";
}

async function compareFiles() 
{
    clearResults('fileResult', 'fileProgress');

    if (!fileLoaded[0] || !fileLoaded[1]) 
    {
        alert("Please wait for both files to finish loading before comparing.");
        return;
    }

    const content1 = fileContents[0].split('\n');
    const content2 = fileContents[1].split('\n');

    await displayDifferences(content1, content2, 'fileResult', 'fileProgress');
    
}

async function compareTextInputs() 
{    
    clearResults('textResult', 'textProgress');

    const content1 = document.getElementById('text1').value.split('\n');
    const content2 = document.getElementById('text2').value.split('\n');

    await displayDifferences(content1, content2, 'textResult', 'textProgress');
}

async function displayDifferences(content1, content2, resultID, progressID) 
{
    let resultHTML = "";
    const progressElement = document.getElementById(progressID);

    const maxLength = Math.max(content1.length, content2.length);
    
    for (let i = 0; i < maxLength; i++) 
    {
        progressElement.textContent = `Comparing line ${i + 1} of ${maxLength}...`;
        await new Promise(resolve => setTimeout(resolve, 0));

        if (content1[i] !== content2[i]) 
        {
            resultHTML += `<div class='difference'>Line ${i + 1}:<br>${highlightDifferences(content1[i] || '', content2[i] || '')}</div><br>`;
        }
    }

    progressElement.textContent = `Comparison complete. (${maxLength} Lines Compared)`;
    document.getElementById(resultID).innerHTML = resultHTML || "Inputs are identical.";
}

function highlightDifferences(text1, text2) 
{
    const words1 = text1.split(' ');
    const words2 = text2.split(' ');
    let result1 = "", result2 = "";
    
    const maxLength = Math.max(words1.length, words2.length);
    for (let i = 0; i < maxLength; i++) 
    {
        if (words1[i] !== words2[i]) 
        {
            if (words1[i]) result1 += `<span class='removed'>${words1[i]}</span> `;
            if (words2[i]) result2 += `<span class='added'>${words2[i]}</span> `;
        } 
        else 
        {
            result1 += words1[i] + " ";
            result2 += words2[i] + " ";
        }
    }

    return `First: ${result1}<br>Second: ${result2}`;
}