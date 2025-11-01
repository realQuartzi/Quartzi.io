---
name: Bingo Board Request
about: Suggest an idea for a new Bingo Board.
title: 'Bingo Board Request: [Game Name] - [Sheet Name]'
labels: Bingo
assignees: realQuartzi

---

## Game Information

**Game Name:**  
_Enter the name of the game this Bingo board is for._  
Example: `Terraria`  

**Game Version:**  
_Enter the game version (specify if modded)._  
Example: `Terraria 1.4.4 (Not Modded)`  

**Sheet Name:**  
_Enter the name of the Bingo sheet._  
Example: `Pre-Hardmode`  

## Bingo Entries

_Provide the Bingo entries as a JSON array with at least 25 items. Each entry must have a `title` and `description`._  

**Example:**
```json
[
  { 
    "title": "Defeat King Slime", 
    "description": "Defeat a King Slime." 
  },
  { 
    "title": "Obtain a Diamond", 
    "description": "Mine or Find a Diamond."
  },
  ...
]
