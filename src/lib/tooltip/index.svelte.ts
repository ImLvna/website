import { mount, unmount } from 'svelte';
import Tooltip from './component.svelte';

export default function tooltip(element: HTMLElement, text: string) {
	element.classList.add('tooltip_underline');

	const props = $state({ x: 0, y: 0, text: text });

	let tooltipComponent: Tooltip;
	function mouseOver(event: MouseEvent) {
		props.x = event.pageX;
		props.y = event.pageY;
		tooltipComponent = mount(Tooltip, {
			props,
			target: document.body
		});
	}
	function mouseMove(event: MouseEvent) {
		props.x = event.pageX;
		props.y = event.pageY;
	}
	function mouseLeave() {
		unmount(tooltipComponent);
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
			props.text = newText;
		}
	};
}
