// DOM
// Type: Text
const copyTextBox = document.querySelector('.copy-text');
const textArea = copyTextBox.querySelector('textarea');
const copyTextButton = copyTextBox.querySelector('button');
// Type: HTML
const copyHTMLBox = document.querySelector('.copy-html');
const htmlSample = copyHTMLBox.querySelector('p');
const copyHTMLButton = copyHTMLBox.querySelector('button');
// Type: PNG
const copyPngBox = document.querySelector('.copy-png');
const pngImage = copyPngBox.querySelector('img');
const copyPngButton = copyPngBox.querySelector('button');
// Type: JPEG
const copyJpegBox = document.querySelector('.copy-jpeg');
const jpegImage = copyJpegBox.querySelector('img');
const copyJpegButton = copyJpegBox.querySelector('button');
// History
const clipboardHistory = document.querySelector('.clipboard-history');
const clipboardItemTemplate = document.querySelector('#clipboard-item-template');

// const
const { clipboard } = navigator;

// event listeners
copyTextButton.addEventListener('click', copyText);
copyHTMLButton.addEventListener('click', copyHTML);
copyPngButton.addEventListener('click', copyPng);
copyJpegButton.addEventListener('click', copyJpeg);

// functions
async function copyText() {
  const text = textArea.value;
  if (!text) return;
  // all clipboard methods are async
  await clipboard.writeText(text);
  await updateHistory();
}

async function copyHTML() {
  const html = htmlSample.innerHTML;
  const blob = new Blob([html], { type: 'text/html' });
  const data = [new ClipboardItem({ [blob.type]: blob })];
  // clipboard.write receives an array of ClipboardItem
  await clipboard.write(data);
  await updateHistory();
}

async function copyPng() {
  // use fetch to get image data and convert to blob
  const response = await fetch(pngImage.src);
  const blob = await response.blob();
  const data = [new ClipboardItem({ [blob.type]: blob })];
  await clipboard.write(data);
  await updateHistory();
}

async function copyJpeg() {
  // use fetch to get image data and convert to blob
  const response = await fetch(jpegImage.src);
  const jpegBlob = await response.blob();
  const pngBlob = await convertJpegToPng({
    jpegBlob,
    // original size of jpeg image
    naturalWidth: jpegImage.naturalWidth,
    naturalHeight: jpegImage.naturalHeight,
  });
  const data = [new ClipboardItem({ [pngBlob.type]: pngBlob })];
  await clipboard.write(data);
  await updateHistory();
}

/**
 * 1. Draw jpeg image on canvas in original size
 * 2. Convert canvas to png blob
 */
async function convertJpegToPng({
  jpegBlob,
  naturalWidth,
  naturalHeight
}) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    // set canvas size to the jpeg image's natrual size
    canvas.width = naturalWidth;
    canvas.height = naturalHeight;
    const img = new Image();
    img.onload = function () {
      context.drawImage(img, 0, 0, naturalWidth, naturalHeight);
      canvas.toBlob(
        function (blob){
          if(blob) resolve(blob);
          else reject('Cannot get blob from image');
        },
        'image/png', // image format is png
        1, // image quality is the best
      )
    };
    img.src = URL.createObjectURL(jpegBlob);
  })
}

async function updateHistory() {
  // get all clipboard history
  const clipboardItems = await clipboard.read();
  for (const clipboardItem of clipboardItems) {
    console.log('clipboardItem', clipboardItem);
    for (const type of clipboardItem.types) {
      // get clipboardItem's content in type of blob
      const blob = await clipboardItem.getType(type);
      console.log('blob', blob);
      const itemDOM = clipboardItemTemplate.content.firstElementChild.cloneNode(true);
      const typeDOM = itemDOM.querySelector('.item-type');
      const contentDOM = itemDOM.querySelector('.item-content');
      // text item
      if (type === 'text/plain') {
        // console.log('text', await blob.text());
        typeDOM.textContent = 'Text';
        contentDOM.textContent = await blob.text();
      }
      // HTML item
      if (type === 'text/html') {
        // console.log('html', await blob.text());
        typeDOM.textContent = 'HTML';
        contentDOM.innerHTML = await blob.text();
      }
      // Png item
      if (type === 'image/png') {
        typeDOM.textContent = 'PNG Image';
        const img = document.createElement('img');
        img.src = URL.createObjectURL(blob);
        contentDOM.append(img);
      }


      clipboardHistory.prepend(itemDOM);
    }
  }
}