function doPost(e) {
    const payload = JSON.parse(e.postData.contents);
    const docId = payload.docId;
    const langCode = payload.lang || "hi"; // default Hindi
  
    const englishDoc = DocumentApp.openById(docId);
    const englishText = englishDoc.getBody().getText();
    const englishFile = DriveApp.getFileById(docId);
    const englishName = englishFile.getName();
  
    const { projectFolder, relativePath } = getProjectFolderAndRelativePath(englishFile);
    if (!projectFolder) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Project not found." }));
    }
  
    const translatedText = LanguageApp.translate(englishText, "en", langCode);
    const charCount = englishText.length;
    const wordCount = englishText.trim().split(/\s+/).length;
    const costUSD = (charCount / 1000000) * 20;
  
    const langFolderName = langCode === "hi" ? "Hindi" : langCode.toUpperCase();
    const langFolder = getExistingOrCreateSubfolder(projectFolder, langFolderName);
    const targetFolder = getOrCreatePath(langFolder, relativePath);
    const targetDoc = getOrCreateDoc(targetFolder, englishName);
  
    targetDoc.getBody().setText(translatedText);
    targetDoc.saveAndClose();
  
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      language: langFolderName,
      chars: charCount,
      words: wordCount,
      cost: `$${costUSD.toFixed(4)}`
    })).setMimeType(ContentService.MimeType.JSON);
  }
  