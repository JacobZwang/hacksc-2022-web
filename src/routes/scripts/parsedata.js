import xml2json from 'xml2json';

export function post({files}) {
    function readFileContent(file) {
		const reader = new FileReader();
		return new Promise((resolve, reject) => {
			reader.onload = (event) => resolve(event.target.result);
			reader.onerror = (error) => reject(error);
			reader.readAsText(file);
		});
	}

    readFileContent(files)
    .then((content) => {
        var jsonString = xml2json.toJson(content);
        var json = JSON.parse(jsonString);
        var content = json.FinalDraft.Content.Paragraph;
        
        content.forEach((element) => console.log(element));
    })
    .catch((error) => console.log(error));

    // handle get
}
  