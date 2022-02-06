import type { RequestHandler } from '@sveltejs/kit';
import xml2json from 'xml2json';

export const post: RequestHandler = async({request}) =>{
   const json  = await request.json()
   const xml = json.data;
    const jsonData = xml2json.toJson(xml, {object: true});
    console.log('JSON DATA', jsonData);
    console.log("TEXT", jsonData.FinalDraft.Content.Paragraph)
    return {
        body: jsonData.FinalDraft.Content.Paragraph,
        status: 200
    }
    // .then((content) => {
    //     const jsonString = xml2json.toJson(content);
    //     const json = JSON.parse(jsonString);
    //     const text = json.FinalDraft.Content.Paragraph;
    //     text.forEach((element) => console.log(element));

    // })
    // .catch((error) => console.log(error));

    // handle get
}
  