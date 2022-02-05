<script>
	import stuff from "./script.fdx?raw"
	import xml2json from 'xml2json'

    var jsonString = xml2json.toJson(stuff);
	var json = JSON.parse(jsonString);
	var content = json.FinalDraft.Content.Paragraph

	content.forEach((element) => console.log(element))
	// console.log()
 
</script>

<h1>{"test"}</h1>