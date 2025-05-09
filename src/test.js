import ytdl from "@distube/ytdl-core";
import fs from "fs";
import { url } from "inspector";

const info = await ytdl.getInfo("https://www.youtube.com/watch?v=VQRLujxTm3c&list=PLrV33OeSoDfXCvtNlexK9WuBEQzfL0L8M", {
   filter: 'audioonly',
   //quality: 'highestaudio',
})


// ytdl("https://www.youtube.com/watch?v=VQRLujxTm3c&list=PLrV33OeSoDfXCvtNlexK9WuBEQzfL0L8M", {
//             filter: 'video',
//             quality: 'highest',
//             highWaterMark: 1 << 30, // 
//             dlChunkSize: 65536 * 2 * 2
// });

// console.log(info)

info.formats.forEach((format) => {
      console.log({
         mimeType: format.mimeType,
         audioQuality: format.audioQuality,
   })  
   }
);

ytdl(url, {f})