export function splitIntoChunks(files) {
  const MAX_FILES_PER_ZIP = 100;
  const MAX_ZIP_SIZE_MB = 50;
  let chunks = [];
  let currentChunk = [];
  let currentSize = 0;

  for (const file of files) {
    const fileSizeMB = file.size / (1024 * 1024); // Convert size to MB

    const exceedsSize = currentSize + fileSizeMB > MAX_ZIP_SIZE_MB;
    const exceedsCount = currentChunk.length >= MAX_FILES_PER_ZIP;

    if (exceedsSize || exceedsCount) {
      //ZAVRSI CHANKUVOANJE
      //RESETUJ BROJAC FAJLOVA I SIZE
      chunks.push({ files: currentChunk, sizeMB: currentSize });
      currentChunk = [];
      currentSize = 0;
    }
    //UVECAVAJ BROJ FAILOVA U TRENUTNOM CHANKU
    currentChunk.push(file);
    //UVECAVAJ SIZE TRENUTNOG CHANKA
    currentSize += fileSizeMB;
  }
  //AKO POSLEDNJI CHUNK NIJE PRAZAN, POVECAJ BROJAC CHANKOVA
  if (currentChunk.length > 0) {
    chunks.push({ files: currentChunk, sizeMB: currentSize });
  }

  return chunks;
}
