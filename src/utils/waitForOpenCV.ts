export function waitForOpenCV(): Promise<void> {
    return new Promise(resolve => {
        const check = () => {
            if (window.cv && window.cv.Mat) resolve();
            else setTimeout(check, 50);
        };
        check();
    });
}
