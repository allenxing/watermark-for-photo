const TextToSVG = require('text-to-svg');
const path = require('path');
const sharp = require('sharp');
const Router = require('@koa/router');

// const fs = require('fs');
const ExifReader = require('exifreader');

// const file = 'https://kamera-b2-s3-cdn.heming.dev/file/kamera-b2/timeline/2023/IMG_5412.jpg';

// https://www.googlefonts.cn/

const file = path.join(process.cwd(), 'resource/16.jpeg');
const readImage = async (file) => {
  return ExifReader.load(file,{expanded: true});
}
// readImage(file);

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
    // const base = sharp({
    //   create: {
    //     width: width,
    //     height: height + bottomHeight,
    //     channels: 4,
    //     background: background || {
    //         r: 0, g: 0, b: 0, alpha: 1,
    //     }
    //   }
    // });
    const { exif } = await readImage(basePicture);
    if(exif) {
      console.log('相机品牌', exif.Make ? exif.Make.description : '');
      console.log('相机型号', exif.Model ? exif.Model.description : '');
      console.log('快门时间', exif.ExposureTime ? exif.ExposureTime.description : '');
      console.log('光圈', exif.FNumber ? exif.FNumber.description : '');
      console.log('ISO', exif.ISOSpeedRatings ? exif.ISOSpeedRatings.description : '');
      console.log('焦距', exif.FocalLength ? exif.FocalLength.description : '');
      console.log('镜头型号', exif.LensModel ? exif.LensModel.description : '');
      console.log('镜头规格', exif.LensSpecification ? exif.LensSpecification.description : '');
      console.log('拍摄时间', exif.DateTime ? exif.DateTime.description : '');
      const options = {
        fontSize,
        anchor: 'top',
        attributes: {
          fill: fontColor
        }
      };
      const textToSvgSync = TextToSVG.loadSync(path.join(process.cwd(), 'resource/Prompt-Regular.ttf'));
      const make = exif.Make ? exif.Make.description : '';
      const model = exif.Model ? exif.Model.description : '';
      const focalLength = exif.FocalLength ? exif.FocalLength.description : '';
      const fNumber = 
        exif.FNumber && exif.FNumber.description ? exif.FNumber.description : '';
      const exposureTime = 
        exif.ExposureTime && exif.ExposureTime.description ? exif.ExposureTime.description : '';
      const iso =
        exif.ISOSpeedRatings && exif.ISOSpeedRatings.description ? exif.ISOSpeedRatings.description : '';

      // 焦距 光圈 快门 ios
      const basicInfo = `${focalLength} ${fNumber} ${exposureTime} ${iso}`;
      const basicInfoBuffer = Buffer.from(textToSvgSync.getSVG(basicInfo, options));
      const basicInfoReader = sharp(basicInfoBuffer);
      const basicInfoTextMeta = await basicInfoReader.metadata();
      const basicInfoTextWidth = basicInfoTextMeta.width || 0;

      // 相机名字
      const modelTextBuffer = Buffer.from(textToSvgSync.getSVG(make + model, options));
      // const modelmodelTextReader = sharp(modelTextBuffer);
      // const modelTextMeta = await modelTextReader.metadata();
      // const modelTextWidth = modelTextMeta.width || 0;
      

      // icon
      const icon = sharp(path.join(process.cwd(), 'resource/apple-dark.svg'));
      
      return base.composite([
        {
          input: basePicture,
          top: 0,
          left: 0
        },
        {
          input: modelTextBuffer,
          top: height + bottomHeight/2 - fontSize / 2,
          left: marginLeftAndRight
        },
        {
          input: basicInfoBuffer,
          top: height + bottomHeight/2 - fontSize / 2,
          left: width - basicInfoTextWidth - marginLeftAndRight
        },
        {
          input: path.join(process.cwd(), 'resource/apple-light.svg'),
          top: height + bottomHeight/2 - fontSize / 2,
          left: width / 2
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
}



// yarn add sharp --ignore-engines

const Koa = require('koa');
const app = new Koa();
const router = new Router();

router.get('/api/watermark', async (ctx, next) => {
  // ctx.router available
  const image = await addWatermark(path.join(process.cwd(), 'resource/demo.jpeg'), path.join(process.cwd(), 'resource/rendered.jpeg'));
  // const stream = await fs.readFileSync(path.join(process.cwd(), 'resource/rendered.jpeg'));
  ctx.body = image;
  ctx.type = 'image/jpeg';
});

app
  .use(router.routes())

app.listen(3008, () => {
    console.log('3008项目启动')
});