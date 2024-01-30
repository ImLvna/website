import Tooltip from './component.svelte';

export default function tooltip(element: HTMLElement, text: string) {
	element.classList.add('tooltip_underline');

	let tooltipComponent: Tooltip;
	function mouseOver(event: MouseEvent) {
		tooltipComponent = new Tooltip({
			props: {
				text,
				x: event.pageX,
				y: event.pageY
			},
			target: document.body
		});
	}
	function mouseMove(event: MouseEvent) {
		tooltipComponent.$set({
			x: event.pageX,
			y: event.pageY
		});
	}
	function mouseLeave() {
		tooltipComponent.$destroy();
	}

	element.addEventListener('mouseover', mouseOver);
	element.addEventListener('mouseleave', mouseLeave);
	element.addEventListener('mousemove', mouseMove);

	return {
		destroy() {
			element.removeEventListener('mouseover', mouseOver);
			element.removeEventListener('mouseleave', mouseLeave);
			element.removeEventListener('mousemove', mouseMove);
		},
		update(newText: string) {
			text = newText;
			tooltipComponent.$set({ text });
		}
	};
}
