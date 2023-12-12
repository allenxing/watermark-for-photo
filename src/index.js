const TextToSVG = require('text-to-svg');
const path = require('path');
const sharp = require('sharp');
const Router = require('@koa/router');
const ExifReader = require('exifreader');

// https://www.googlefonts.cn/

// const file = path.join(process.cwd(), 'resource/16.jpeg');
const readImage = async (file) => {
  return ExifReader.load(file,{expanded: true});
}

const getImage = (image) => {
  return path.join(process.cwd(), `resource/${image}`)
}
const marginLeftAndRight = 100;
const bottomHeight = 168;
const fontSize = 48;
const logoSize = 64;
const padding = 15;
const dividPadding = 20;
const dividWidth = 2;
const isDark = true;

const darkConfig = {
  bg:  {
    r: 0, g: 0, b: 0, alpha: 1,
  },
  dividBg: {
    r: 255, g: 255, b: 255, alpha: 0.9,
  },
  fontColor: 'white',
}

const lightConfig = {
  bg:  {
    r: 255, g: 255, b: 255, alpha: 1,
  } ,
  dividBg: {
    r: 0, g: 0, b: 0, alpha: 0.9,
  },
  fontColor: 'black',
}

async function addWatermark(basePicture, config) {
  const reader = sharp(basePicture);
  const { width = 0, height = 0 } = await reader.metadata();
  const base = sharp({
    create: {
      width: width,
      height: height + bottomHeight,
      channels: 4,
      background: config.bg
    }
  });
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
        fill: config.fontColor
      }
    };
    const textToSvgSync = TextToSVG.loadSync(getImage('Prompt-Regular.ttf'));
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
    const basicInfoTextHeight = basicInfoTextMeta.height || 0;

    // 相机名字
    const deviceName = `${make} ${model}`;
    const modelTextBuffer = Buffer.from(textToSvgSync.getSVG(deviceName, options));
    const modelTextReader = sharp(modelTextBuffer);
    const modelTextMeta = await modelTextReader.metadata();
    // const modelTextWidth = modelTextMeta.width || 0;
    const modelTextHeight = modelTextMeta.height || 0;
    // time
    const time = `${exposureTime}`;
    const timeTextBuffer = Buffer.from(textToSvgSync.getSVG(time, options));
    const timeTextReader = sharp(timeTextBuffer);
    const timeTextMeta = await timeTextReader.metadata();
    const timeTextHeight = timeTextMeta.height || 0;

    // icon
    const dji = await sharp(getImage('dji-dark.svg')).resize({ height: logoSize }).toBuffer();
    const canon = await sharp(getImage('canon.svg')).resize({ height: logoSize }).toBuffer();
    const fujifilm = await sharp(getImage('fujifilm.svg')).resize({ height: logoSize }).toBuffer();
    const hassel = await sharp(getImage('hassel-blue.svg')).resize({ height: logoSize }).toBuffer();
    const nikon = await sharp(getImage('nikon.svg')).resize({ height: logoSize }).toBuffer();
    const huawei = await sharp(getImage('huawei.svg')).resize({ height: logoSize }).toBuffer();
    const sony = await sharp(getImage('sony.svg')).resize({ height: logoSize }).toBuffer();
    const leica = await sharp(getImage('leica.svg')).resize({ height: logoSize }).toBuffer();
    const apple = await sharp(getImage('apple-dark.svg')).resize({ height: logoSize }).toBuffer();
    const icon = sharp(getImage('apple-dark.svg')).resize({ height: logoSize });
    const iconMeta = await icon.metadata();
    console.log(iconMeta.width, iconMeta.height)
    const iconWidth = 0;
    const iconBuffer = await icon.toBuffer();
    
    return base.composite([
      {
        input: basePicture,
        top: 0,
        left: 0
      },
      {
        input: modelTextBuffer,
        top: height + padding,
        // top: Math.round(height + bottomHeight/2 - modelTextHeight / 2),
        left: marginLeftAndRight
      },
      {
        input: timeTextBuffer,
        top: height + bottomHeight - padding - timeTextHeight,
        left: marginLeftAndRight
      },
      // 分割线
      {
        input: {
          create: {
            width: dividWidth,
            height: bottomHeight - 100,
            channels: 4,
            background: config.dividBg
          }
        },
        top: height + 50,
        left: width - basicInfoTextWidth - marginLeftAndRight - dividPadding
      },
      {
        input: basicInfoBuffer,
        top: Math.round(height + bottomHeight / 2 - basicInfoTextHeight / 2),
        left: width - basicInfoTextWidth - marginLeftAndRight
      },
      // {
      //   // input: path.join(process.cwd(), 'resource/apple-light.svg'),
      //   input: path.join(process.cwd(), 'resource/dji-dark.svg'),
      //   top: Math.round(height + bottomHeight/2 - logoSize / 2),
      //   left: Math.round(width / 2)
      // },
      {
        input: iconBuffer,
        top: Math.round(height + bottomHeight/2 - logoSize / 2),
        left: width - basicInfoTextWidth - marginLeftAndRight - dividPadding - dividPadding - dividWidth - iconWidth
      }
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
  let config = lightConfig;
  if (ctx.query.isdark) {
    config = darkConfig
  }
  const image = await addWatermark(getImage('demo.jpeg'),config);
  // const stream = await fs.readFileSync(path.join(process.cwd(), 'resource/rendered.jpeg'));
  console.log(ctx.query.isdark)
  ctx.body = image;
  ctx.type = 'image/jpeg';
});

app
  .use(router.routes())

app.listen(3008, () => {
    console.log('3008项目启动')
});