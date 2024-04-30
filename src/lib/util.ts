export function HideOnError(e: Event & { currentTarget: Element & EventTarget }) {
	(e.currentTarget as HTMLElement).style.display = 'none';
}

export function ShowOnSuccess(e: Event & { currentTarget: Element & EventTarget }) {
	(e.currentTarget as HTMLElement).style.display = 'initial';
}
