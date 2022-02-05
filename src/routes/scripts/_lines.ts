export function findLineWraps(textElement, lineHeight) {
	return Array.from(textElement.children).reduce(
		(lines: WrappedLine[], word: HTMLElement, i) => {
			const lastLine = lines[lines.length - 1];
			const rect = word.getBoundingClientRect();
			const wordHeight = rect.bottom - rect.top;

			if (lastLine.top === word.getBoundingClientRect().top + window.scrollY) {
				lastLine.wordCount += 1;
				lastLine.lastWordIndex = i;
			} else {
				lines.push({
					top: rect.top + window.scrollY,
					// bottom: rect.bottom + window.scrollY,
					bottom: rect.top + lineHeight,
					wordCount: 0, // ! word count is zero indexed!
					lastWordIndex: i,
					firstWordIndex: i,
					lineHeight: wordHeight
				});
			}
			return lines;
		},
		[
			{
				top: textElement.children[0].getBoundingClientRect().top + window.scrollY,
				bottom:
					textElement.children[0].getBoundingClientRect().top +
					window.scrollY +
					lineHeight,
				wordCount: -1, // first word is word 0
				lastWordIndex: 0,
				firstWordIndex: 0,
				lineHeight: 0
			}
		]
	);
}

export type WrappedLine = {
	top: number;
	bottom: number;
	wordCount: number;
	lastWordIndex: number;
	firstWordIndex: number;
	lineHeight: number;
};