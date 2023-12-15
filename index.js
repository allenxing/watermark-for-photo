const TextToSVG = require('text-to-svg');
const path = require('path');
const sharp = require('sharp');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');

const ExifReader = require('exifreader');
const fs = require('fs');
// https://www.googlefonts.cn/
// https://www.flickr.com/cameras

const getResource = (image) => {
  return path.join(process.cwd(), `resource/${image}`)
}
const readImage = async (file) => {
  return ExifReader.load(file,{expanded: true});
}
// (async function(){
//   const data = await readImage(getResource('rendered.jpeg'));
//   console.log(1, data.exif);
// })()

const isCanon = (device) => {
  return device.toLowerCase().includes('canon');
}
const isSony = (device) => {
  return device.toLowerCase().includes('sony');
}
const isApple = (device) => {
  return device.toLowerCase().includes('apple');
}
const isNikon = (device) => {
  return device.toLowerCase().includes('nikon');
}
const isFujifilm = (device) => {
  return device.toLowerCase().includes('fujifilm');
}

const isLeica = (device) => {
  return device.toLowerCase().includes('leica');
}

const isHuawei = (device) => {
  return device.toLowerCase().includes('huawei');
}

const isHassel = (device) => {
  return device.toLowerCase().includes('hasselblad');
}

const isDji = (device) => {
  return device.toLowerCase().includes('dji');
}

const isRicoh = (device) => {
  return device.toLowerCase().includes('ricoh');
}

const isPanasonic = (device) => {
  return device.toLowerCase().includes('panasonic');
}

const marginLeftAndRight = 100;
const bottomHeight = 168;
const fontSize = 48;
const logoSize = 64;
const padding = 15;
const dividPadding = 20;
const dividWidth = 2;

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

async function autoAddWatermark(basePicture, config, isDark) {
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
    // console.log('相机品牌', exif.Make ? exif.Make.description : '');
    // console.log('相机型号', exif.Model ? exif.Model.description : '');
    // console.log('快门时间', exif.ExposureTime ? exif.ExposureTime.description : '');
    // console.log('光圈', exif.FNumber ? exif.FNumber.description : '');
    // console.log('ISO', exif.ISOSpeedRatings ? exif.ISOSpeedRatings.description : '');
    // console.log('焦距', exif.FocalLength ? exif.FocalLength.description : '');
    // console.log('镜头型号', exif.LensModel ? exif.LensModel.description : '');
    // console.log('镜头规格', exif.LensSpecification ? exif.LensSpecification.description : '');
    // console.log('拍摄时间', exif.DateTime ? exif.DateTime.description : '');
    const options = {
      fontSize ,
      anchor: 'top',
      attributes: {
        fill: config.fontColor
      }
    };
    const subOptions = {
      fontSize,
      anchor: 'top',
      attributes: {
        fill: config.fontColor
      }
    };
    const make = exif.Make ? exif.Make.description : '';
    const model = exif.Model ? exif.Model.description : '';
    const focalLength = (exif.FocalLength ? exif.FocalLength.description : '').replace(/\s+/g, '');
    const fNumber = 
      exif.FNumber && exif.FNumber.description ? exif.FNumber.description : '';
    const exposureTime = 
      exif.ExposureTime && exif.ExposureTime.description ? exif.ExposureTime.description : '';
    const iso =
      exif.ISOSpeedRatings && exif.ISOSpeedRatings.description ? exif.ISOSpeedRatings.description : '';

    const time = exif.DateTime ? exif.DateTime.description : '';

    if(!make && !model) {
      return reader.toBuffer();
    }
    const textToSvgSync = TextToSVG.loadSync(getResource('font/Prompt-Regular.ttf'));
    const textLightToSvgSync = TextToSVG.loadSync(getResource('font/Prompt-Light.ttf'));

    // 焦距 光圈 快门 ios
    const basicInfo = `${focalLength} ${fNumber} ${exposureTime} ${iso}`;
    const basicInfoBuffer = Buffer.from(textToSvgSync.getSVG(basicInfo, options));
    const basicInfoReader = sharp(basicInfoBuffer);
    const basicInfoTextMeta = await basicInfoReader.metadata();
    const basicInfoTextWidth = basicInfoTextMeta.width || 0;
    const basicInfoTextHeight = basicInfoTextMeta.height || 0;

    // 相机名字
    const deviceName = isApple(make) ? `${make} ${model}` : model;
    const modelTextBuffer = Buffer.from(textToSvgSync.getSVG(deviceName, options));
    // const modelTextReader = sharp(modelTextBuffer);
    // const modelTextMeta = await modelTextReader.metadata();
    // const modelTextHeight = modelTextMeta.height || 0;
    // time
    const timeTextBuffer = Buffer.from(textLightToSvgSync.getSVG(time, subOptions));
    const timeTextReader = sharp(timeTextBuffer);
    const timeTextMeta = await timeTextReader.metadata();
    const timeTextHeight = timeTextMeta.height || 0;

    // icon
    // const dji = await sharp(getResource('dji-dark.svg')).resize({ height: logoSize }).toBuffer();
    // const canon = await sharp(getResource('canon.svg')).resize({ height: logoSize }).toBuffer();
    // const fujifilm = await sharp(getResource('fujifilm.svg')).resize({ height: logoSize }).toBuffer();
    // const hassel = await sharp(getResource('hassel-blue.svg')).resize({ height: logoSize }).toBuffer();
    // const nikon = await sharp(getResource('nikon.svg')).resize({ height: logoSize }).toBuffer();
    // const huawei = await sharp(getResource('huawei.svg')).resize({ height: logoSize }).toBuffer();
    // const sony = await sharp(getResource('sony.svg')).resize({ height: logoSize }).toBuffer();
    // const leica = await sharp(getResource('leica.svg')).resize({ height: logoSize }).toBuffer();
    // const apple = await sharp(getResource('apple-dark.svg')).resize({ height: logoSize }).toBuffer();
    let icon = await sharp(getResource('apple-dark.svg')).resize({ height: logoSize }).toBuffer();
    if(isApple(make)) {
      icon = await sharp(getResource(isDark ? 'apple-light.svg' : 'apple-dark.svg')).resize({ height: logoSize }).toBuffer();;
    } else if(isCanon(make)) {
      icon = await sharp(getResource('canon.svg')).resize({ height: logoSize }).toBuffer();;
    } else if(isNikon(make)) {
      icon = await sharp(getResource('nikon.svg')).resize({ height: logoSize }).toBuffer();
    } else if (isSony(make)) {
      icon = await sharp(getResource(isDark ? 'sony-light.svg' : 'sony.svg')).resize({ height: logoSize }).toBuffer();
    } else if(isFujifilm(make)) {
      // 待调整
      icon = await sharp(getResource(isDark ? 'fujifilm-light.svg' : 'fujifilm.svg' )).resize({ height: logoSize / 2 }).toBuffer();
    } else if(isLeica(make)) {
      icon = await sharp(getResource('leica.svg')).resize({ height: logoSize }).toBuffer();
    } else if(isHuawei(make)) {
      icon = await sharp(getResource('huawei.svg')).resize({ height: logoSize }).toBuffer();
    } else if(isHassel(make)) {
      icon = await sharp(getResource(isDark ? 'hassel-light.svg' : 'hassel-dark.svg' )).resize({ height: logoSize }).toBuffer();
    }  else if(isDji(make)) {
      icon = await sharp(getResource(isDark ? 'dji-light.svg' : 'dji-dark.svg' )).resize({ height: logoSize }).toBuffer();
    } else if(isRicoh(make)) {
      icon = await sharp(getResource(isDark ? 'ricoh.svg' : 'ricoh.svg' )).resize({ height: logoSize }).toBuffer();
    } else if(isPanasonic(make)) {
      icon = await sharp(getResource(isDark ? 'panasonic-blue.svg' : 'panasonic-blue.svg' )).resize({ height: logoSize }).toBuffer();
    }
    const iconMeta = await sharp(icon).metadata();
    const iconWidth = iconMeta.width || 0;
    const iconHeight = iconMeta.height || 0;
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
      {
        input: icon,
        top: Math.round(height + bottomHeight/2 - iconHeight / 2),
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
  } else {
    return reader.toBuffer();
  }
}

async function addWatermark(config, isDark, exif, tiff, gps) {
  const width = 1920;
  const base = sharp({
    create: {
      width: width,
      height: bottomHeight,
      channels: 4,
      background: config.bg
    }
  });

  if(exif && tiff) {
    const options = {
      fontSize ,
      anchor: 'top',
      attributes: {
        fill: config.fontColor
      }
    };
    const subOptions = {
      fontSize,
      anchor: 'top',
      attributes: {
        fill: config.fontColor
      }
    };
    
    const model = tiff.Model || '';
    const make = tiff.Make || '';
    const focalLength = exif.FocalLenIn35mmFilm || '';
    const fNumber = exif.FNumber || '';
    const exposureTime = `1/${Math.round(1/ exif.ExposureTime)}`;
    const iso = exif.ISOSpeedRatings || '';

    const time = exif.DateTimeOriginal || '';

    if(!model || !make) {
      return;
    }
    const textToSvgSync = TextToSVG.loadSync(getResource('font/Prompt-Regular.ttf'));
    const textLightToSvgSync = TextToSVG.loadSync(getResource('font/Prompt-Light.ttf'));

    // 焦距 光圈 快门 ios
    const basicInfo = `${focalLength} ${fNumber} ${exposureTime} ${iso}`;
    const basicInfoBuffer = Buffer.from(textToSvgSync.getSVG(basicInfo, options));
    const basicInfoReader = sharp(basicInfoBuffer);
    const basicInfoTextMeta = await basicInfoReader.metadata();
    const basicInfoTextWidth = basicInfoTextMeta.width || 0;
    const basicInfoTextHeight = basicInfoTextMeta.height || 0;

    // 相机名字
    const deviceName = model;
    const modelTextBuffer = Buffer.from(textToSvgSync.getSVG(deviceName, options));
    // const modelTextReader = sharp(modelTextBuffer);
    // const modelTextMeta = await modelTextReader.metadata();
    // const modelTextHeight = modelTextMeta.height || 0;
    // time
    const timeTextBuffer = Buffer.from(textLightToSvgSync.getSVG(time, subOptions));
    const timeTextReader = sharp(timeTextBuffer);
    const timeTextMeta = await timeTextReader.metadata();
    const timeTextHeight = timeTextMeta.height || 0;

    // icon
    let icon = await sharp(getResource('apple-dark.svg')).resize({ height: logoSize }).toBuffer();
    if(isApple(make)) {
      icon = await sharp(getResource(isDark ? 'apple-light.svg' : 'apple-dark.svg')).resize({ height: logoSize }).toBuffer();;
    } else if(isCanon(make)) {
      icon = await sharp(getResource('canon.svg')).resize({ height: logoSize }).toBuffer();;
    } else if(isNikon(make)) {
      icon = await sharp(getResource('nikon.svg')).resize({ height: logoSize }).toBuffer();
    } else if (isSony(make)) {
      icon = await sharp(getResource(isDark ? 'sony-light.svg' : 'sony.svg')).resize({ height: logoSize }).toBuffer();
    } else if(isFujifilm(make)) {
      // 待调整
      icon = await sharp(getResource(isDark ? 'fujifilm-light.svg' : 'fujifilm.svg' )).resize({ height: logoSize / 2 }).toBuffer();
    } else if(isLeica(make)) {
      icon = await sharp(getResource('leica.svg')).resize({ height: logoSize }).toBuffer();
    } else if(isHuawei(make)) {
      icon = await sharp(getResource('huawei.svg')).resize({ height: logoSize }).toBuffer();
    } else if(isHassel(make)) {
      icon = await sharp(getResource(isDark ? 'hassel-light.svg' : 'hassel-dark.svg' )).resize({ height: logoSize }).toBuffer();
    }  else if(isDji(make)) {
      icon = await sharp(getResource(isDark ? 'dji-light.svg' : 'dji-dark.svg' )).resize({ height: logoSize }).toBuffer();
    } else if(isRicoh(make)) {
      icon = await sharp(getResource(isDark ? 'ricoh.svg' : 'ricoh.svg' )).resize({ height: logoSize }).toBuffer();
    } else if(isPanasonic(make)) {
      icon = await sharp(getResource(isDark ? 'panasonic-blue.svg' : 'panasonic-blue.svg' )).resize({ height: logoSize }).toBuffer();
    }
    const iconMeta = await sharp(icon).metadata();
    const iconWidth = iconMeta.width || 0;
    const iconHeight = iconMeta.height || 0;
    return base.composite([
      {
        input: modelTextBuffer,
        top: padding,
        // top: Math.round(height + bottomHeight/2 - modelTextHeight / 2),
        left: marginLeftAndRight
      },
      {
        input: timeTextBuffer,
        top: bottomHeight - padding - timeTextHeight,
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
        top: 50,
        left: width - basicInfoTextWidth - marginLeftAndRight - dividPadding
      },
      {
        input: basicInfoBuffer,
        top: Math.round(bottomHeight / 2 - basicInfoTextHeight / 2),
        left: width - basicInfoTextWidth - marginLeftAndRight
      },
      {
        input: icon,
        top: Math.round(bottomHeight/2 - iconHeight / 2),
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

router.get('/', async (ctx, next) => {
  ctx.body = 'ok';
});

router.get('/api/watermark', async (ctx, next) => {
  let config = lightConfig;
  const isDark = !!ctx.query.isdark;
  if (isDark) {
    config = darkConfig
  }
  const image = await autoAddWatermark(getResource('test/apple-test.jpg'), config, isDark);
  // const stream = await fs.readFileSync(path.join(process.cwd(), 'resource/rendered.jpeg'));
  // await fs.writeFileSync(path.join(process.cwd(), 'resource/base64.txt'), image.toString('base64'));

  // await fs.writeFileSync(path.join(process.cwd(), 'resource/rendered.jpeg'), Buffer.from(image.toString('base64'), 'base64'));

  ctx.body = image;
  ctx.type = 'image/jpeg';
});

router.post('/api/watermark', async (ctx, next) => {
  let config = lightConfig;
  const {isDark, exif, tiff, gps} = ctx.request.body
  const isdark = !!isDark;
  if (isdark) {
    config = darkConfig
  }

  if(!exif) {
    ctx.body = {
      code: 1001,
      message: 'exif is empty'
    }
  }
  console.log('--------');
  console.log(exif);
  console.log(tiff);
  const image = await addWatermark(config, isdark, exif, tiff, gps);
  if (image) {
    // await fs.writeFileSync(path.join(process.cwd(), 'resource/bottom.jpg'), image);
    ctx.body = {
      code: 0,
      img: image.toString('base64')
    }
  } else {
    ctx.body = {
      code: 1002,
      message: 'error'
    }
  }
});


app.use(bodyParser());
app
  .use(router.routes());

app.listen(3008, () => {
    console.log('3008项目启动')
});