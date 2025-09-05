// Mock implementation of HTMX
const mockHtmx = {
    onLoad: () => {},
    process: () => {},
    on: () => {},
    off: () => {},
    trigger: (eventName, detail) => {
        const event = new CustomEvent(eventName, { detail });
        document.body.dispatchEvent(event);
    },
    ajax: () => {},
};

export default mockHtmx;
