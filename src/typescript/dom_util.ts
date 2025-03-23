// Helper functions for creating DOM elements.

export function createSpan(text: string, spanClass?: string) {
    const span: HTMLSpanElement = document.createElement('span');
    span.innerText = text;
    if (spanClass) {
        span.className = spanClass;
    }
    return span;
}

export function createDiv(text: string | null, divClass: string, children: HTMLElement[] = []) {
    const div: HTMLDivElement = document.createElement('div');
    if (text) {
        div.innerText = text;
    }
    if (divClass) {
        div.className = divClass;
    }
    for (const child of children) {
        div.appendChild(child);
    }
    return div;
}