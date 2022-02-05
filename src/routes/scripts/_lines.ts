export function findLineWraps(textElement, lineHeight): WrappedLine[] {
	return Array.from(textElement.children).reduce<WrappedLine[]>(
		(lines: WrappedLine[], word: HTMLElement, i) => {
			const lastLine = lines[lines.length - 1];
			const rect = word.getBoundingClientRect();
			// const wordHeight = rect.bottom - rect.top;

			if (lastLine.top === word.getBoundingClientRect().top + window.scrollY) {
				lastLine.wordCount += 1;
				lastLine.lastWordIndex = i;
			} else {
				lines.push({
					top: rect.top + window.scrollY,
					bottom: rect.bottom + window.scrollY,
					// bottom: rect.top + lineHeight / 2,
					wordCount: 1,
					lastWordIndex: i,
					firstWordIndex: i
					// lineHeight: wordHeight
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
					lineHeight / 2,
				wordCount: 0,
				lastWordIndex: 0,
				firstWordIndex: 0
				// lineHeight: 0
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
	// lineHeight: number;
};
