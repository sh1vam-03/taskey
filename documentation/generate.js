/**
 * generate.js
 * ─────────────────────────────────────────────────────────
 * TASKTIME — BCA Project Report Generator
 * ─────────────────────────────────────────────────────────
 * Run:  node generate.js
 * Out:  documentation/TASKTIME_BCA_Project_Report.docx
 * ─────────────────────────────────────────────────────────
 * Chapter files:
 *   00_frontmatter.js          → Title, Certificate, Declaration, Ack, Abstract
 *   01_introduction.js         → Chapter 1
 *   02_survey_of_technologies.js → Chapter 2
 *   03_requirements_analysis.js → Chapter 3
 *   04_system_design.js        → Chapter 4
 *   05_implementation_testing.js → Chapter 5
 *   06_results_discussion.js   → Chapter 6
 *   07_conclusion.js           → Chapter 7
 *   08_references.js           → References
 *   09_appendix.js             → Appendix A–D
 * ─────────────────────────────────────────────────────────
 */

const { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle } =
    require('docx');
const fs = require('fs');
const path = require('path');

// ─── Import all chapters ──────────────────────────────
const { content: frontmatter } = require('./00_frontmatter');
const { content: ch1 } = require('./01_introduction');
const { content: ch2 } = require('./02_literature_review');
const { content: ch3 } = require('./03_system_analysis');
const { content: ch4 } = require('./04_system_design');
const { content: ch5 } = require('./05_implementation');
const { content: ch6 } = require('./06_testing');
const { content: ch7 } = require('./07_results');
const { content: ch8 } = require('./08_conclusion');
const { content: ch9 } = require('./09_references');
const { content: app } = require('./10_appendix');

const {
    NUMBERING_CONFIG, STYLES_CONFIG, PAGE_PROPERTIES,
    makeHeader, makeFooter, FONT,
    txt, jp, jpp, h1, h2, h3, sp, pb,
} = require('./helpers');

// ─── Table of Contents entries ───────────────────────
const TOC_ENTRIES = [
    ['Title Page', ''],
    ['Certificate', ''],
    ['Declaration', ''],
    ['Acknowledgement', ''],
    ['Abstract', ''],
    ['Table of Contents', ''],
    ['Chapter 1: Introduction', ''],
    ['  1.1  Background', ''],
    ['  1.2  Objectives', ''],
    ['  1.3  Purpose, Scope, and Applicability', ''],
    ['  1.4  Achievements', ''],
    ['  1.5  Organisation of Report', ''],
    ['Chapter 2: Survey of Technologies', ''],
    ['  2.1  Frontend Technologies', ''],
    ['  2.2  Backend Technologies', ''],
    ['  2.3  Database Technologies', ''],
    ['  2.4  AI Technologies', ''],
    ['  2.5  Deployment and Infrastructure', ''],
    ['Chapter 3: Requirements and Analysis', ''],
    ['  3.1  Problem Definition', ''],
    ['  3.2  Requirements Specification', ''],
    ['  3.3  Planning and Scheduling', ''],
    ['  3.4  Software and Hardware Requirements', ''],
    ['  3.5  Preliminary Product Description', ''],
    ['  3.6  Conceptual Models', ''],
    ['Chapter 4: System Design', ''],
    ['  4.1  Basic Modules', ''],
    ['  4.2  System Architecture', ''],
    ['  4.3  Database Design', ''],
    ['  4.4  AI Pipeline Architecture', ''],
    ['  4.5  Productivity Scoring Algorithm', ''],
    ['  4.6  Billing System Design', ''],
    ['Chapter 5: Implementation', ''],
    ['  5.1  Implementation Approaches', ''],
    ['  5.2  Coding Details — Key Implementations', ''],
    ['  5.3  Implementation Challenges and Solutions', ''],
    ['Chapter 6: Testing', ''],
    ['  6.1  Testing Strategy', ''],
    ['Chapter 7: Results and Discussion', ''],
    ['  7.1  Deployment Status', ''],
    ['  7.2  Feature Implementation Summary', ''],
    ['  7.3  Test Reports', ''],
    ['  7.4  Discussion', ''],
    ['Chapter 8: Conclusions and Future Scope', ''],
    ['  8.1  Conclusion', ''],
    ['  8.2  Limitations of the System', ''],
    ['  8.3  Future Scope of the Project', ''],
    ['References and Bibliography', ''],
    ['Appendix A: Complete API Endpoint Reference', ''],
    ['Appendix B: Technical Glossary', ''],
    ['Appendix C: Project Timeline', ''],
    ['Appendix D: Third-Party Library and Service Licences', ''],
];

const tocPage = [
    h1('TABLE OF CONTENTS'),
    ...TOC_ENTRIES.map(([title]) =>
        new Paragraph({
            spacing: { before: 80, after: 80, line: 360 },
            children: [
                new TextRun({
                    text: title,
                    font: FONT,
                    size: title.startsWith('Chapter') ? 24 : title.startsWith('  ') ? 22 : 24,
                    bold: title.startsWith('Chapter') || (!title.startsWith(' ') && !title.includes('  ')),
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
    styles: STYLES_CONFIG,
    sections: [{
        properties: PAGE_PROPERTIES,
        headers: { default: makeHeader() },
        footers: { default: makeFooter() },
        children: [
            ...frontmatter,
            ...tocPage,
            ...ch1,
            ...ch2,
            ...ch3,
            ...ch4,
            ...ch5,
            ...ch6,
            ...ch7,
            ...ch8,
            ...ch9,
            ...app,
        ],
    }],
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
        console.log('📋  Chapters included:');
        console.log('    00  Front Matter (Title, Certificate, Declaration, Ack, Abstract)');
        console.log('    TOC Table of Contents');
        console.log('    01  Chapter 1 — Introduction');
        console.log('    02  Chapter 2 — Survey of Technologies');
        console.log('    03  Chapter 3 — Requirements and Analysis');
        console.log('    04  Chapter 4 — System Design');
        console.log('    05  Chapter 5 — Implementation');
        console.log('    06  Chapter 6 — Testing');
        console.log('    07  Chapter 7 — Results and Discussion');
        console.log('    08  Chapter 8 — Conclusions and Future Scope');
        console.log('    09  References and Bibliography');
        console.log('    10  Appendix A–D');
        console.log('');
        console.log('🎓  Tulsi College, Beed | BCA Final Year 2025–2026');
    })
    .catch(err => {
        console.error('❌  Generation failed:', err.message);
        process.exit(1);
    });