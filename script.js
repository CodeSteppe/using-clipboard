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

const clipboardHistory = document.querySelector('.clipboard-history');
const clipboardItemTemplate = document.querySelector('#clipboard-item-template');

// const
const { clipboard } = navigator;

// event listeners
copyTextButton.addEventListener('click', copyText);
copyJpegButton.addEventListener('click', copyJpeg);
copyPngButton.addEventListener('click', copyPng);
// pngImg.addEventListener('dblclick', copyPng);

// functions
async function copyText() {
  const text = textArea.value;
  if (!text) return;
  await clipboard.writeText(text);
  await updateHistory();
}

async function copyJpeg() {
  const response = await fetch(jpegImg.src)
  const jpegBlob = await response.blob();
  const pngBlob = await convertJpegToPng({
    jpegBlob,
    naturalWidth: jpegImg.naturalWidth,
    naturalHeight: jpegImg.naturalHeight
  });
  const data = [new ClipboardItem({ [pngBlob.type]: pngBlob })];
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

function convertJpegToPng({
  jpegBlob,
  naturalWidth,
  naturalHeight
}) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = naturalWidth
    canvas.height = naturalHeight
    const img = new Image();
    img.onload = function () {
      context.drawImage(img, 0, 0, naturalWidth, naturalHeight)
      canvas.toBlob(
        function (blob) {
          if (blob) resolve(blob)
          else reject('Cannot get blob from image element')
        },
        'image/png',
        1,
      )
    }
    img.src = URL.createObjectURL(jpegBlob);
  })
}

async function updateHistory() {
  const clipboardItems = await clipboard.read();

  for (const clipboardItem of clipboardItems) {
    console.log('clipboardItem', clipboardItem)
    for (const type of clipboardItem.types) {
      const blob = await clipboardItem.getType(type);
      console.log('blob', blob)
      const itemDOM = clipboardItemTemplate.content.firstElementChild.cloneNode(true);
      const typeDOM = itemDOM.querySelector('.item-type');
      const contentDOM = itemDOM.querySelector('.item-content');
      // text item
      if (type === 'text/plain') {
        typeDOM.textContent = 'Text';
        contentDOM.textContent = await blob.text();
        // console.log('text', await blob.text());
      }
      // png item
      if (type === 'image/png') {
        // console.log('image', await blob.text());
        typeDOM.textContent = 'PNG Image';
        const img = document.createElement('img');
        img.src = URL.createObjectURL(blob);
        contentDOM.append(img);
      }
      clipboardHistory.prepend(itemDOM);
    }
  }
}