const TextToSVG = require('text-to-svg');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const ExifReader = require('exifreader');

// const file = 'https://kamera-b2-s3-cdn.heming.dev/file/kamera-b2/timeline/2023/IMG_5412.jpg';

// https://www.googlefonts.cn/

const file = path.join(process.cwd(), 'resource/16.jpeg');
const readImage = async () => {
  const tags = await ExifReader.load(file,{expanded: true});
  console.log(tags);
}
readImage();

const background = null;
const marginLeftAndRight = 100;
const bottomHeight = 200;
const fontSize = 32;
const fontColor = 'black';
const text = 'heming';

async function addWatermark(basePicture, newFilePath) {
  const reader = sharp(basePicture);
  const { width = 0, height = 0 } = await reader.metadata();
    const base = sharp({
      create: {
        width: width,
        height: height + bottomHeight,
        channels: 4,
        background: background || {
            r: 255, g: 255, b: 255, alpha: 1,
        }
      }
    });
    const textToSvgSync = TextToSVG.loadSync(path.join(process.cwd(), 'resource/Prompt-Regular.ttf'));
    const options = {
      fontSize,
      anchor: 'top',
      attributes: {
        fill: fontColor
      }
    };

    // 文字转svg，svg转buffer
    const svgTextBuffer = Buffer.from(textToSvgSync.getSVG(text, options));
    const textReader = sharp(svgTextBuffer);
    const textMeta = await textReader.metadata();
    const textWidth = textMeta.width || 0;
    const textHeight = textMeta.height || 0;
    return base.composite([
      {
        input: basePicture,
        top: 0,
        left: 0
      },
      {
        input: svgTextBuffer,
        top: height + bottomHeight/2 - fontSize / 2,
        left: marginLeftAndRight
      },
      {
        input: svgTextBuffer,
        top: height + bottomHeight/2 - fontSize / 2,
        left: width - textWidth - marginLeftAndRight
      },
    ])
    .withMetadata() // 在输出图像中包含来自输入图像的所有元数据(EXIF、XMP、IPTC)。
    .webp({
        quality: 100
    }) //使用这些WebP选项来输出图像。
    // .toFile(newFilePath)
    .toBuffer()
    .catch(err => {
      console.log(err)
    })
}



// yarn add sharp --ignore-engines

const Koa = require('koa');
const app = new Koa();

app.use(async ctx => {
  const image = await addWatermark(path.join(process.cwd(), 'resource/5.jpg'), path.join(process.cwd(), 'resource/rendered.jpeg'));
  // const stream = await fs.readFileSync(path.join(process.cwd(), 'resource/rendered.jpeg'));
  ctx.body = image;
  ctx.type = 'image/jpeg';
});

app.listen(3008, () => {
    console.log('3008项目启动')
});