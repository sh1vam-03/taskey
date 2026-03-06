/**
 * helpers.js
 * ──────────────────────────────────────────────────────
 * Shared utility functions for all TASKTIME documentation
 * chapter files. Import from here — do NOT duplicate.
 * ──────────────────────────────────────────────────────
 */

const {
    Paragraph, TextRun, Table, TableRow, TableCell,
    AlignmentType, HeadingLevel, BorderStyle, WidthType,
    ShadingType, VerticalAlign, PageBreak, LevelFormat,
    Header, Footer,
} = require('/home/claude/.npm-global/lib/node_modules/docx');

// ─── Constants ────────────────────────────────────────
const FONT = 'Times New Roman';
const W = 9360; // usable page width in DXA (twips)
const BORDER = { style: BorderStyle.SINGLE, size: 4, color: 'AAAAAA' };
const ALL_BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };

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
    spacing: { before: opts.before ?? 120, after: opts.after ?? 120, line: opts.line ?? 360 },
    indent: opts.left ? { left: opts.left } : undefined,
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    border: opts.border ?? undefined,
});

/** Justified body paragraph (standard body text) */
const jpp = (text, opts = {}) => new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 120, after: 180, line: 420 },
    children: [txt(text, opts)],
});

/** Simple centred / left / right inline paragraph */
const jp = (text, opts = {}) => new Paragraph({
    alignment: opts.align ?? AlignmentType.LEFT,
    spacing: { before: opts.before ?? 120, after: opts.after ?? 120, line: opts.line ?? 360 },
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
const sp = () => jp('', { before: 80, after: 80 });
const sp2 = () => jp('', { before: 200, after: 200 });
const pb = () => new Paragraph({ children: [new PageBreak()] });

// ─── Code Block ───────────────────────────────────────
const codeBlock = (lines) => lines.map(line => new Paragraph({
    children: [code(line)],
    spacing: { before: 28, after: 28, line: 300 },
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
            bold: opts.bold ?? false,
            size: opts.size ?? 22,
            color: opts.tc ?? '000000',
            italic: opts.italic ?? false,
        })],
    })],
});

/**
 * tbl(headers, rows, widths?)
 *   headers : string[]
 *   rows    : string[][]
 *   widths  : number[]  (DXA values, must sum ≤ W)
 */
const tbl = (headers, rows, widths) => {
    const n = headers.length;
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
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1260, bottom: 1440, left: 1620 },
    },
};

const makeHeader = () => new Header({
    children: [new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '003366', space: 4 } },
        spacing: { before: 0, after: 120 },
        children: [
            txt('TASKTIME  —  AI-Powered Task & Schedule Management SaaS Platform', { size: 18, color: '003366' }),
            new TextRun({ text: '     |     Tulsi College, Beed  |  BCA 2025–2026', font: FONT, size: 18, color: '777777' }),
        ],
    })],
});

const makeFooter = () => new Footer({
    children: [new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: '003366', space: 4 } },
        spacing: { before: 120, after: 0 },
        alignment: AlignmentType.CENTER,
        children: [txt('Dr. Babasaheb Ambedkar Marathwada University  |  BCA Final Year Project  |  Academic Year 2025–2026', { size: 18, color: '777777' })],
    })],
});

// ─── Exports ──────────────────────────────────────────
module.exports = {
    // constants
    FONT, W,
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
    NUMBERING_CONFIG, STYLES_CONFIG, PAGE_PROPERTIES, makeHeader, makeFooter,
};