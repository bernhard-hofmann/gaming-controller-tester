class SvgService {
    public static async getByUrl(url: string): Promise<SVGElement> {
        const response = await fetch(url);
        const svgText = await response.text();
        const parser = new DOMParser();
        const svgDocument = parser.parseFromString(svgText, 'image/svg+xml');
        
        const svgElement = svgDocument.documentElement;
        if (!(svgElement instanceof SVGElement)) {
            throw new Error('Parsed document is not an SVG element');
        }
        
        return svgElement;
    }
}

export { SvgService };
