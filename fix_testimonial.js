const fs = require('fs');
let r = fs.readFileSync('index.html', 'utf8');

// Remove testimonials section HTML
r = r.replace(/<!-- Testimonials -->[\r\n ]*<section class[^>]*testimonials[^>]*>[\r\n ]*<div class[^>]*container[^>]*>[\r\n ]*<div class[^>]*section-header[^>]*>[\r\n ]*<h2>[^<]*<\/h2>[\r\n ]*<p>[^<]*<\/p>[\r\n ]*<\/div>[\r\n ]*<div class[^>]*testimonial-card[^>]*>[\r\n ]*<p>[^<]*<\/p>[\r\n ]*<div class[^>]*author[^>]*>[^<]*<\/div>[\r\n ]*<\/div>[\r\n ]*<\/div>[\r\n ]*<\/section>/g, '');

// Remove testimonials CSS block
r = r.replace(/        \/\/* Testimonials[\r\n ]*[\/*\n ]*        \/\/[\r\n ]*        \/\/\n/g, '');

// Shorter approach: find the section and cut it
const idx = r.indexOf('<!-- Testimonials -->');
const endIdx = r.indexOf('<!-- Objections -->');
if (idx >= 0 && endIdx >= 0) {
    r = r.substring(0, idx) + r.substring(endIdx);
    console.log('Removed testimonials section from', idx, 'to', endIdx);
} else {
    console.log('Could not find testimonials section boundaries');
    console.log('idx:', idx, 'endIdx:', endIdx);
}

fs.writeFileSync('index.html', r);
console.log('Done. Checking...');
console.log('Still has Participante satisfecho:', r.includes('Participante satisfecho'));
console.log('Still has testimonials section:', r.includes('class=\"testimonials\"'));