export function oklchToRgb(oklch) {
    // Extract numeric values → oklch(L C h)
    const match = oklch.match(/oklch\s*\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s*\)/i);
    if (!match) return null;

    let [_, L, C, h] = match;
    L = parseFloat(L);
    C = parseFloat(C);
    h = parseFloat(h) * (Math.PI / 180); // degrees → radians

    // Convert LCh → Lab
    const a = C * Math.cos(h);
    const b = C * Math.sin(h);

    // Convert OKLab → LMS
    const l = L + 0.3963377774 * a + 0.2158037573 * b;
    const m = L - 0.1055613458 * a - 0.0638541728 * b;
    const s = L - 0.0894841775 * a - 1.2914855480 * b;

    // Convert LMS → linear RGB
    let r =  4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    let b2 = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

    // Linear → gamma corrected
    const f = v => v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1/2.4) - 0.055;

    r = Math.round(Math.min(Math.max(0, f(r)), 1) * 255);
    g = Math.round(Math.min(Math.max(0, f(g)), 1) * 255);
    b2 = Math.round(Math.min(Math.max(0, f(b2)), 1) * 255);

    return `rgb(${r}, ${g}, ${b2})`;
}

export function oklabToRgb(oklab) {
    const match = oklab.match(/oklab\s*\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s*\)/i);
    if (!match) return null;

    let [_, L, a, b] = match;
    L = parseFloat(L); a = parseFloat(a); b = parseFloat(b);

    const l = L + 0.3963377774 * a + 0.2158037573 * b;
    const m = L - 0.1055613458 * a - 0.0638541728 * b;
    const s = L - 0.0894841775 * a - 1.2914855480 * b;

    let r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    let b2 = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

    const f = v => v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1/2.4) - 0.055;

    r = Math.round(Math.min(Math.max(0, f(r)), 1) * 255);
    g = Math.round(Math.min(Math.max(0, f(g)), 1) * 255);
    b2 = Math.round(Math.min(Math.max(0, f(b2)), 1) * 255);

    return `rgb(${r}, ${g}, ${b2})`;
}