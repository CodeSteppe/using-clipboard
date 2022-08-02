// DOM
const copyTextBox = document.querySelector('.copy-text');
const textArea = copyTextBox.querySelector('textarea');
const copyTextButton = copyTextBox.querySelector('button');

const copyJpegBox = document.querySelector('.copy-jpeg');
const jpegImg = copyJpegBox.querySelector('img');
const copyJpegButton = copyJpegBox.querySelector('button');

const copyPngBox = document.querySelector('.copy-png');
const pngImg = copyPngBox.querySelector('img');
const copyPngButton = copyPngBox.querySelector('button');

// const
const { clipboard } = navigator;

// event listeners
copyTextButton.addEventListener('click', copyText);
copyJpegButton.addEventListener('click', copyJpeg);
copyPngButton.addEventListener('click', copyPng);

// functions
async function copyText() {
  const text = textArea.value;
  await clipboard.writeText(text);
  await updateHistory();
}

async function copyJpeg() {
  const response = await fetch(jpegImg.src)
  const blob = await response.blob();
  const data = [new ClipboardItem({ [blob.type]: blob })];
  await clipboard.write(data);
  await updateHistory();
}

async function copyPng() {
  const response = await fetch(pngImg.src)
  const blob = await response.blob();
  const data = [new ClipboardItem({ [blob.type]: blob })];
  await clipboard.write(data);
  await updateHistory();
}

async function updateHistory() {
  const clipboardItems = await clipboard.read();

  for (const clipboardItem of clipboardItems) {
    console.log('clipboardItem', clipboardItem)
    for (const type of clipboardItem.types) {
      const blob = await clipboardItem.getType(type);
      console.log('blob', blob)
      // text item
      if (type === 'text/plain') {
        console.log('text', await blob.text());
      }
    }
  }
}