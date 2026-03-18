/**
 * helpers.js
 * ──────────────────────────────────────────────────────
 * Shared utility functions for all TASKTIME documentation
 * chapter files. Import from here — do NOT duplicate.
 *
 * Changes from v1:
 *  - Line spacing changed to 1.2 (line: 276) throughout
 *  - makeChapterHeader(name) — per-chapter header for body sections
 *  - makePageNumberFooter()  — page number only, used after TOC
 *  - emptyHeader() / emptyFooter() — used on frontmatter + TOC pages
 *  - Logo loading helper (reads from logos/ folder if present)
 * ──────────────────────────────────────────────────────
 */

const {
    Paragraph, TextRun, Table, TableRow, TableCell,
    AlignmentType, HeadingLevel, BorderStyle, WidthType,
    ShadingType, VerticalAlign, PageBreak, LevelFormat,
    Header, Footer, PageNumber, ImageRun,
} = require('docx');

const fs = require('fs');
const path = require('path');

// ─── Constants ────────────────────────────────────────
const FONT = 'Times New Roman';
const W = 9360; // usable page width in DXA (twips)
const LINE_12 = 276; // 1.2 × 240 = 288 → use 276 for comfortable 1.2
const BORDER = { style: BorderStyle.SINGLE, size: 4, color: 'AAAAAA' };
const ALL_BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };

// ─── Logo loader ─────────────────────────────────────
/**
 * Tries to load logo from logos/ subfolder.
 * Returns Buffer or null if not found.
 */
const loadLogo = (filename) => {
    const logoPath = path.join(__dirname, 'logos', filename);
    if (fs.existsSync(logoPath)) {
        return fs.readFileSync(logoPath);
    }
    return null;
};

/**
 * Creates an ImageRun for a logo file, or null if not found.
 * width/height in EMU (914400 = 1 inch, 685800 = 0.75 inch)
 */
const logoRun = (filename, widthEMU = 685800, heightEMU = 685800) => {
    const buf = loadLogo(filename);
    if (!buf) return null;
    return new ImageRun({
        data: buf,
        transformation: { width: widthEMU / 9144, height: heightEMU / 9144 },
        type: filename.endsWith('.png') ? 'png' : 'jpg',
    });
};

/**
 * Creates a centered paragraph with both university and college logos.
 * Falls back to empty paragraph if logos not found.
 */
const logoParagraph = () => {
    const bamuLogo   = logoRun('bamu_logo.png',   685800, 685800);
    const collegeLogo = logoRun('college_logo.png', 685800, 685800);

    const children = [];
    if (bamuLogo)   children.push(bamuLogo);
    if (bamuLogo && collegeLogo) children.push(new TextRun({ text: '          ', font: FONT }));
    if (collegeLogo) children.push(collegeLogo);

    if (children.length === 0) return null;

    return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 240 },
        children,
    });
};

// ─── Text Run Helpers ─────────────────────────────────
const txt = (text, opts = {}) => new TextRun({
    text: String(text ?? ''),
    font: FONT,
    size: opts.size ?? 24,
    bold: opts.bold ?? false,
    italics: opts.italic ?? false,
    color: opts.color ?? '000000',
    underline: opts.underline ? {} : undefined,
});

const code = (text) => new TextRun({
    text: String(text ?? ''),
    font: 'Courier New',
    size: 20,
    color: '1a1a2e',
});

// ─── Paragraph Helpers ────────────────────────────────

/** Generic paragraph with custom children array */
const para = (children, opts = {}) => new Paragraph({
    children: Array.isArray(children) ? children : [children],
    alignment: opts.align ?? AlignmentType.LEFT,
    spacing: { before: opts.before ?? 120, after: opts.after ?? 120, line: opts.line ?? LINE_12 },
    indent: opts.left ? { left: opts.left } : undefined,
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    border: opts.border ?? undefined,
});

/** Justified body paragraph — 1.2 spacing */
const jpp = (text, opts = {}) => new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 120, after: 160, line: LINE_12 },
    children: [txt(text, opts)],
});

/** Simple centred / left / right inline paragraph */
const jp = (text, opts = {}) => new Paragraph({
    alignment: opts.align ?? AlignmentType.LEFT,
    spacing: { before: opts.before ?? 120, after: opts.after ?? 120, line: opts.line ?? LINE_12 },
    children: [txt(text, { size: opts.size, bold: opts.bold, italic: opts.italic, color: opts.color })],
});

// ─── Heading Helpers ──────────────────────────────────
const h1 = (text) => new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [txt(text, { bold: true, size: 32, color: '003366' })],
    spacing: { before: 480, after: 240 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: '003366', space: 6 } },
});

const h2 = (text) => new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [txt(text, { bold: true, size: 28, color: '003366' })],
    spacing: { before: 320, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '88AACC', space: 4 } },
});

const h3 = (text) => new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [txt(text, { bold: true, size: 26, color: '1A4D7A' })],
    spacing: { before: 240, after: 120 },
});

const h4 = (text) => new Paragraph({
    children: [txt(text, { bold: true, size: 24 })],
    spacing: { before: 200, after: 80 },
});

// ─── List Helpers ─────────────────────────────────────
const bul = (text) => new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    children: [txt(text)],
    spacing: { before: 80, after: 80 },
    indent: { left: 720, hanging: 360 },
});

const num = (text) => new Paragraph({
    numbering: { reference: 'numbers', level: 0 },
    children: [txt(text)],
    spacing: { before: 80, after: 80 },
});

// ─── Spacing / Page Break ─────────────────────────────
const sp  = () => jp('', { before: 80,  after: 80  });
const sp2 = () => jp('', { before: 200, after: 200 });
const pb  = () => new Paragraph({ children: [new PageBreak()] });

// ─── Code Block ───────────────────────────────────────
const codeBlock = (lines) => lines.map(line => new Paragraph({
    children: [code(line)],
    spacing: { before: 28, after: 28, line: 240 }, // single spacing for code
    indent: { left: 720 },
    shading: { fill: 'F5F5F5', type: ShadingType.CLEAR },
}));

// ─── Table Helpers ────────────────────────────────────
const _cell = (content, opts = {}) => new TableCell({
    borders: ALL_BORDERS,
    width: { size: opts.w ?? Math.floor(W / (opts.cols ?? 2)), type: WidthType.DXA },
    shading: opts.shade ? { fill: opts.shade, type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 140, right: 140 },
    verticalAlign: VerticalAlign.CENTER,
    columnSpan: opts.span ?? 1,
    children: [new Paragraph({
        alignment: opts.align ?? AlignmentType.LEFT,
        spacing: { before: 40, after: 40 },
        children: [txt(content, {
            bold:   opts.bold ?? false,
            size:   opts.size ?? 22,
            color:  opts.tc ?? '000000',
            italic: opts.italic ?? false,
        })],
    })],
});

const tbl = (headers, rows, widths) => {
    const n  = headers.length;
    const ws = widths ?? headers.map(() => Math.floor(W / n));
    return new Table({
        width: { size: W, type: WidthType.DXA },
        columnWidths: ws,
        rows: [
            new TableRow({
                children: headers.map((h, i) =>
                    _cell(h, { w: ws[i], bold: true, shade: 'D0E4F5', cols: n })),
            }),
            ...rows.map(row =>
                new TableRow({
                    children: row.map((c, i) =>
                        _cell(c, { w: ws[i], cols: n })),
                })),
        ],
    });
};

// ─── Document-Level Config ────────────────────────────
const NUMBERING_CONFIG = {
    config: [
        {
            reference: 'bullets',
            levels: [{
                level: 0,
                format: LevelFormat.BULLET,
                text: '\u2022',
                alignment: AlignmentType.LEFT,
                style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            }],
        },
        {
            reference: 'numbers',
            levels: [{
                level: 0,
                format: LevelFormat.DECIMAL,
                text: '%1.',
                alignment: AlignmentType.LEFT,
                style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            }],
        },
    ],
};

const STYLES_CONFIG = {
    default: {
        document: { run: { font: FONT, size: 24 } },
    },
    paragraphStyles: [
        {
            id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
            run: { size: 32, bold: true, font: FONT, color: '003366' },
            paragraph: { spacing: { before: 480, after: 240 }, outlineLevel: 0 },
        },
        {
            id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
            run: { size: 28, bold: true, font: FONT, color: '003366' },
            paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 1 },
        },
        {
            id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
            run: { size: 26, bold: true, font: FONT, color: '1A4D7A' },
            paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 },
        },
    ],
};

const PAGE_PROPERTIES = {
    page: {
        size:   { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1260, bottom: 1440, left: 1620 },
    },
};

// ─── Headers and Footers ──────────────────────────────

/** Empty header — used on all frontmatter and TOC pages */
const emptyHeader = () => new Header({
    children: [new Paragraph({ children: [] })],
});

/** Empty footer — used on all frontmatter and TOC pages (no page numbers) */
const emptyFooter = () => new Footer({
    children: [new Paragraph({ children: [] })],
});

/**
 * Chapter header — shows chapter name.
 * Used on all body chapter pages (after TOC).
 * @param {string} chapterName  e.g. 'Chapter 1: Introduction'
 */
const makeChapterHeader = (chapterName) => new Header({
    children: [new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '003366', space: 4 } },
        spacing: { before: 0, after: 120 },
        children: [
            txt('TASKTIME', { size: 18, bold: true, color: '003366' }),
            new TextRun({ text: '     |     ', font: FONT, size: 18, color: 'AAAAAA' }),
            txt(chapterName, { size: 18, color: '003366' }),
            new TextRun({ text: '     |     Tulsi College, Beed  |  BCA 2025–2026', font: FONT, size: 18, color: '888888' }),
        ],
    })],
});

/**
 * Page number footer — shows centered page number only.
 * Used on all body chapter pages (after TOC).
 */
const makePageNumberFooter = () => new Footer({
    children: [new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: '003366', space: 4 } },
        spacing: { before: 120, after: 0 },
        alignment: AlignmentType.CENTER,
        children: [
            new TextRun({
                children: [PageNumber.CURRENT],
                font: FONT,
                size: 20,
                color: '333333',
            }),
        ],
    })],
});

// ─── Exports ──────────────────────────────────────────
module.exports = {
    // constants
    FONT, W, LINE_12,
    // logos
    logoParagraph,
    // text
    txt, code,
    // paragraphs
    para, jpp, jp,
    // headings
    h1, h2, h3, h4,
    // lists
    bul, num,
    // spacing
    sp, sp2, pb,
    // code
    codeBlock,
    // tables
    tbl,
    // doc config
    NUMBERING_CONFIG, STYLES_CONFIG, PAGE_PROPERTIES,
    // headers / footers
    emptyHeader, emptyFooter, makeChapterHeader, makePageNumberFooter,
    // legacy (kept for compatibility)
    makeHeader: makeChapterHeader.bind(null, 'TASKTIME — BCA Project Report'),
    makeFooter: makePageNumberFooter,
};
