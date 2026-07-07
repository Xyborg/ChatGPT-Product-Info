#!/usr/bin/env node

global.window = global;
require('../chrome-extension/geo-core.js');

const classifyDomain = global.CgptGeoResearchCore && global.CgptGeoResearchCore.classifyDomain;
if (typeof classifyDomain !== 'function') {
    throw new Error('classifyDomain export was not found.');
}

const cases = [
    ['nih.gov', 'gov-edu'],
    ['berkeley.edu', 'gov-edu'],
    ['cam.ac.uk', 'gov-edu'],
    ['ec.europa.eu', 'gov-edu'],
    ['service-public.fr', 'gov-edu'],
    ['amazon.com', 'retailer'],
    ['shop.amazon.de', 'retailer'],
    ['zalando.de', 'retailer'],
    ['bol.com', 'retailer'],
    ['carrefour.fr', 'retailer'],
    ['apple.com', 'brand'],
    ['samsung.com', 'brand'],
    ['bosch-home.com', 'brand'],
    ['miele.de', 'brand'],
    ['idealo.de', 'price'],
    ['pricerunner.com', 'price'],
    ['geizhals.de', 'price'],
    ['example-commercial-site.com', 'commercial'],
];

const failures = cases
    .map(([domain, expected]) => ({ domain, expected, actual: classifyDomain(domain) }))
    .filter((item) => item.actual !== item.expected);

if (failures.length) {
    failures.forEach((item) => {
        console.error(`${item.domain}: expected ${item.expected}, got ${item.actual}`);
    });
    process.exit(1);
}

console.log(`classifyDomain smoke test passed (${cases.length} cases).`);
