# RPG Adventure

Adventure is a fantasy tabletop RPG created by James Mayr. This application is a virtual gameplay environment.

---
<pre>
  _____    _____  
 / .. /|  |\  . \ 
/____/ |  |.\____\
| .. |.|  |.| .. |
| .. | /  \ | .. |
|____|/    \|____|
</pre>
---

## Application
Create an account by entering a unique 8-character username and a password.
The application includes several primary tools:
* *settings*: create, find, and join games; edit user name and password
* *rules*: search the Adventure compendium, including character and creature templates, skills, items, conditions, and more
* *character*: create and manage a character, including rolling dice, adjusting skills and statistics, acquiring items, and more
* *chat*: communicate anonymously, as yourself, or as your character, to one or all players
* *content*: upload and share text, images, audio, and embedded webpages, as well as interactive tabletop arenas

## Code
The app is powered by nodeJS, written in 100% raw javascript.
It uses the following packages:
* *websocket*: for real-time communication between client and server
* *mongodb*: for nosql database storage
* *aws-sdk*: for user-generated asset management

---
<pre>
rpgadventure
|
|- package.json
|
|- index.js (launchServer, handleRequest, parseRequest, routeRequest, \_302, \_403, \_404; handleSocket, parseSocket, routeSocket, sendSocketData, \_400)
|
|- node_modules
|   |- aws-sdk
|   |- mongodb
|   |- websocket
|
|- node
|   |- character.js (createOne; readOne, unreadOne, readAll; updateOne, updateName, updateAccess, updateData, updateImage; deleteOne)
|   |- chat.js (createOne; readAll)
|   |- content.js (createOne; readOne, unreadOne, readAll; updateOne, updateName, updateAccess, updateData, updateFile, updateArena; deleteOne)
|   |- core.js (logError, logStatus, logMessage, logTime; getEnvironment, getContentType, getSchema, getAsset; isNumLet; renderHTML, constructHeaders, duplicateObject, alphabetizeArray; hashRandom, generateRandom, chooseRandom, rollRandom; accessFiles, accessS3; accessDatabase, accessMongo)
|   |- game.js (createOne; readOne, unreadOne; deleteOne)
|   |- home.js (signIn, signOut)
|   |- roll.js (createOne; readAll; updateOne)
|   |- session.js (createOne; readOne; updateOne)
|   |- user.js (createOne; readOneSelf; updateOne, updateName, updatePassword, updateSettings, updateGame, updateCharacter, updateContent; deleteOne)
|
|- js
|   |- game.js (initiateApp, findElements, attachListeners; createSocket, checkSocket, receiveSocket; addToRolls, updateInRolls, receiveRolls, createRollGroup, updateRollGroup; changeTool; listGames, changeGameSelection, selectGame, receiveGame, clearGame, deleteGame, updateUserVolume, updateUserName, updateUserPassword, receiveUser, signout; searchRules, displaySearchResult, sendSearchResultToChat, addSearchResultToCharacter; changeCharacterMode, saveCharacter, receiveCharacter, listCharacterTemplates, listCharacters, changeCharacterSelection, selectCharacter, uploadCharacter, downloadCharacter, updateCharacterAccess, updateCharacterName, duplicateCharacter, deleteCharacter, rollDie, displayCharacter, rolld20, rolld6, toggled6, uploadCharacterImage, resetCharacterImage, listCharacterRaces, updateCharacterInfo, updateCharacterRace, displayCharacterInfo, updateCharacterStatistic, displayCharacterStatistic, listCharacterSkills, addCharacterSkill, removeCharacterSkill, updateCharacterSkill, displayCharacterSkill, listCharacterItems, addCharacterItem, removeCharacterItem, updateCharacterItem, equipCharacterItem, displayCharacterItems, listCharacterConditions, addCharacterCondition, removeCharacterCondition, displayCharacterConditions, updateCharacterDamage, recoverCharacterDamage, damageCharacterStatistic; listChatRecipients, submitChat, receiveChat, createChat; listContent, changeContentSelection, selectContent, sendContentToChat, openContentFromChat, updateContentName, updateContentAccess, updateContentData, uploadContentFile, duplicateContent, deleteContent, displayContent, displayContentInChat, receiveContent, grabContent, moveContent, ungrabContent, zoomContent, addContentArenaObject, updateContentArenaObject, removeContentArenaObject, displayContentArena, displayContentArenaObjectListing, displayContentArenaCanvas, displayContentArenaObject, displayContentArenaGrid, zoomArena, panContentArena, startPanningContentArena, stopPanningContentArena, grabContentArenaObject, moveContentArenaObject, ungrabContentArenaObject)
|   |- home.js (submitSignUp, submitSignIn; switchSignUp, switchSignIn)
|   |- main.js (isNumLet; duplicateObject, sendPost, showToast; generateRandom, sortRandom; resizeCanvas, clearCanvas, translateCanvas, rotateCanvas, drawLine, drawCircle, drawRectangle, drawImage, drawText)
|
|- css
|   |- game.css
|   |- main.css
|
|- html
|   |- _404.html
|   |- game.html
|   |- home.html
|
|- assets
	|- d20.png
	|- logo.png
</pre>
