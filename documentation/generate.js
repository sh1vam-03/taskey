/**
 * generate.js
 * ─────────────────────────────────────────────────────────
 * TASKTIME — BCA Project Report Generator  v2
 * ─────────────────────────────────────────────────────────
 * Run:  node generate.js
 * Out:  TASKTIME_BCA_Project_Report.docx
 * ─────────────────────────────────────────────────────────
 *
 * LOGO SETUP (Optional but recommended):
 *   1. Create a folder called  logos/  inside this directory
 *   2. Place the following files inside it:
 *        logos/bamu_logo.png      ← BAMU university logo
 *        logos/college_logo.png   ← Tulsi College logo
 *   3. Run:  node generate.js
 *   Logos will appear centred on the title page.
 *   If logos are absent the title page still generates correctly.
 *
 * SECTION LAYOUT:
 *   Section 1  — Frontmatter (Title, Cert, Decl, Ack, Abstract, TOC)
 *                 → NO header, NO footer, NO page numbers
 *   Section 2  — Chapter 1 (Introduction)
 *                 → Chapter header  |  Page number footer  (starts at 1)
 *   Section 3  — Chapter 2 (Survey of Technologies)      …and so on
 *   …
 *   Section 11 — References + Appendix
 * ─────────────────────────────────────────────────────────
 */

const { Document, Packer, Paragraph, TextRun, AlignmentType } = require('docx');
const fs   = require('fs');
const path = require('path');

// ─── Import all chapters ──────────────────────────────
const { content: frontmatter } = require('./00_frontmatter');
const { content: ch1 }         = require('./01_introduction');
const { content: ch2 }         = require('./02_literature_review');
const { content: ch3 }         = require('./03_system_analysis');
const { content: ch4 }         = require('./04_system_design');
const { content: ch5 }         = require('./05_implementation');
const { content: ch6 }         = require('./06_testing');
const { content: ch7 }         = require('./07_results');
const { content: ch8 }         = require('./08_conclusion');
const { content: ch9 }         = require('./09_references');
const { content: app }         = require('./10_appendix');

const {
    NUMBERING_CONFIG, STYLES_CONFIG, PAGE_PROPERTIES,
    emptyHeader, emptyFooter,
    makeChapterHeader, makePageNumberFooter,
    FONT,
    txt, jp, h1, sp, pb,
} = require('./helpers');

// ─── Helper: build a body section ────────────────────
/**
 * Creates one section with chapter header + page-number footer.
 * pageNumberStart: pass 1 for the first chapter to restart numbering.
 */
const bodySection = (chapterName, children, pageNumberStart) => ({
    properties: {
        ...PAGE_PROPERTIES,
        ...(pageNumberStart !== undefined ? { pageNumberStart } : {}),
    },
    headers: { default: makeChapterHeader(chapterName) },
    footers: { default: makePageNumberFooter() },
    children,
});

// ─── Table of Contents ────────────────────────────────
const TOC_ENTRIES = [
    ['Title Page',                                        ''],
    ['Certificate',                                       ''],
    ['Declaration',                                       ''],
    ['Acknowledgement',                                   ''],
    ['Abstract',                                          ''],
    ['Table of Contents',                                 ''],
    ['Chapter 1: Introduction',                           ''],
    ['  1.1  Background',                                 ''],
    ['  1.2  Objectives',                                 ''],
    ['  1.3  Purpose, Scope, and Applicability',          ''],
    ['  1.4  Achievements',                               ''],
    ['  1.5  Organisation of Report',                     ''],
    ['Chapter 2: Survey of Technologies',                 ''],
    ['  2.1  Frontend Technologies',                      ''],
    ['  2.2  Backend Technologies',                       ''],
    ['  2.3  Database Technologies',                      ''],
    ['  2.4  AI Technologies',                            ''],
    ['  2.5  Mobile Technologies',                        ''],
    ['  2.6  Deployment and Infrastructure',              ''],
    ['Chapter 3: Requirements and Analysis',              ''],
    ['  3.1  Problem Definition',                         ''],
    ['  3.2  Requirements Specification',                 ''],
    ['  3.3  Planning and Scheduling',                    ''],
    ['  3.4  Software and Hardware Requirements',         ''],
    ['  3.5  Preliminary Product Description',            ''],
    ['  3.6  Conceptual Models',                          ''],
    ['Chapter 4: System Design',                         ''],
    ['  4.1  Basic Modules',                              ''],
    ['  4.2  System Architecture',                        ''],
    ['  4.3  Database Design',                            ''],
    ['  4.4  AI Pipeline Architecture',                   ''],
    ['  4.5  Productivity Scoring Algorithm',             ''],
    ['  4.6  Billing System Design',                      ''],
    ['  4.7  Mobile Application Architecture',            ''],
    ['Chapter 5: Implementation',                        ''],
    ['  5.1  Implementation Approaches',                  ''],
    ['  5.2  Coding Details — Key Implementations',       ''],
    ['  5.3  Implementation Challenges and Solutions',    ''],
    ['  5.4  Mobile Application Implementation',          ''],
    ['Chapter 6: Testing',                               ''],
    ['  6.1  Testing Strategy',                           ''],
    ['Chapter 7: Results and Discussion',                ''],
    ['  7.1  Deployment Status',                          ''],
    ['  7.2  Feature Implementation Summary',             ''],
    ['  7.3  Test Reports',                               ''],
    ['  7.4  Discussion',                                 ''],
    ['Chapter 8: Conclusions and Future Scope',          ''],
    ['  8.1  Conclusion',                                 ''],
    ['  8.2  Limitations of the System',                  ''],
    ['  8.3  Future Scope of the Project',                ''],
    ['References and Bibliography',                      ''],
    ['Appendix A: Complete API Endpoint Reference',      ''],
    ['Appendix B: Technical Glossary',                   ''],
    ['Appendix C: Project Timeline',                     ''],
    ['Appendix D: Third-Party Library and Service Licences', ''],
];

const tocPage = [
    h1('TABLE OF CONTENTS'),
    ...TOC_ENTRIES.map(([title]) =>
        new Paragraph({
            spacing: { before: 80, after: 80, line: 276 },
            children: [
                new TextRun({
                    text: title,
                    font: FONT,
                    size:  title.startsWith('Chapter') ? 24 : title.startsWith('  ') ? 22 : 24,
                    bold:  title.startsWith('Chapter') || (!title.startsWith(' ') && !title.includes('  ')),
                    color: title.startsWith('Chapter') ? '003366' : '222222',
                }),
            ],
        })
    ),
    pb(),
];

// ─── Compile document ─────────────────────────────────
const doc = new Document({
    numbering: NUMBERING_CONFIG,
    styles:    STYLES_CONFIG,

    sections: [

        // ══════════════════════════════════════════════
        // SECTION 1 — Frontmatter + TOC
        //   • NO header
        //   • NO footer
        //   • NO page numbers
        // ══════════════════════════════════════════════
        {
            properties: PAGE_PROPERTIES,
            headers: { default: emptyHeader() },
            footers: { default: emptyFooter() },
            children: [
                ...frontmatter,
                ...tocPage,
            ],
        },

        // ══════════════════════════════════════════════
        // SECTION 2 — Chapter 1: Introduction
        //   • Chapter header
        //   • Page number footer (restart at 1)
        // ══════════════════════════════════════════════
        bodySection('Chapter 1: Introduction', ch1, 1),

        // ══════════════════════════════════════════════
        // SECTION 3 — Chapter 2: Survey of Technologies
        // ══════════════════════════════════════════════
        bodySection('Chapter 2: Survey of Technologies', ch2),

        // ══════════════════════════════════════════════
        // SECTION 4 — Chapter 3: Requirements and Analysis
        // ══════════════════════════════════════════════
        bodySection('Chapter 3: Requirements and Analysis', ch3),

        // ══════════════════════════════════════════════
        // SECTION 5 — Chapter 4: System Design
        // ══════════════════════════════════════════════
        bodySection('Chapter 4: System Design', ch4),

        // ══════════════════════════════════════════════
        // SECTION 6 — Chapter 5: Implementation
        // ══════════════════════════════════════════════
        bodySection('Chapter 5: Implementation', ch5),

        // ══════════════════════════════════════════════
        // SECTION 7 — Chapter 6: Testing
        // ══════════════════════════════════════════════
        bodySection('Chapter 6: Testing', ch6),

        // ══════════════════════════════════════════════
        // SECTION 8 — Chapter 7: Results and Discussion
        // ══════════════════════════════════════════════
        bodySection('Chapter 7: Results and Discussion', ch7),

        // ══════════════════════════════════════════════
        // SECTION 9 — Chapter 8: Conclusions and Future Scope
        // ══════════════════════════════════════════════
        bodySection('Chapter 8: Conclusions and Future Scope', ch8),

        // ══════════════════════════════════════════════
        // SECTION 10 — References
        // ══════════════════════════════════════════════
        bodySection('References and Bibliography', ch9),

        // ══════════════════════════════════════════════
        // SECTION 11 — Appendix
        // ══════════════════════════════════════════════
        bodySection('Appendix', app),
    ],
});

// ─── Write output ─────────────────────────────────────
const outPath = path.join(__dirname, 'TASKTIME_BCA_Project_Report.docx');

Packer.toBuffer(doc)
    .then(buf => {
        fs.writeFileSync(outPath, buf);
        const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
        console.log('');
        console.log('✅  Document generated successfully!');
        console.log(`📄  Output : ${outPath}`);
        console.log(`💾  Size   : ${kb} KB`);
        console.log('');
        console.log('📋  Structure:');
        console.log('    Section 1  Frontmatter + TOC    [no header / no footer / no page numbers]');
        console.log('    Section 2  Chapter 1            [chapter header | page numbers from 1]');
        console.log('    Section 3  Chapter 2            [chapter header | page numbers]');
        console.log('    Section 4  Chapter 3            [chapter header | page numbers]');
        console.log('    Section 5  Chapter 4            [chapter header | page numbers]');
        console.log('    Section 6  Chapter 5            [chapter header | page numbers]');
        console.log('    Section 7  Chapter 6            [chapter header | page numbers]');
        console.log('    Section 8  Chapter 7            [chapter header | page numbers]');
        console.log('    Section 9  Chapter 8            [chapter header | page numbers]');
        console.log('    Section 10 References           [chapter header | page numbers]');
        console.log('    Section 11 Appendix             [chapter header | page numbers]');
        console.log('');
        console.log('💡  To add logos, place these files in a logos/ subfolder:');
        console.log('       logos/bamu_logo.png');
        console.log('       logos/college_logo.png');
        console.log('    Then regenerate.');
        console.log('');
        console.log('🎓  Tulsi College, Beed | BCA Final Year 2025–2026');
    })
    .catch(err => {
        console.error('❌  Generation failed:', err.message);
        process.exit(1);
    });
