import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractDriveFileId,
  extractDriveFolderId,
  buildDrivePreviewUrl,
  calculateProgressStats,
  canAccessBonus,
  canAccessVipClasses,
  filterNonDuplicateDriveFiles,
} from './driveUtils.ts';
import {
  getSpanishBonusManual,
  generateSpanishBonusPdfBytes,
} from './spanishBonusPdf.ts';

test('extractDriveFileId parses standard Google Drive URLs and raw IDs', () => {
  assert.equal(
    extractDriveFileId('https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view?usp=sharing'),
    '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs'
  );
  assert.equal(
    extractDriveFileId('https://drive.google.com/open?id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs'),
    '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs'
  );
  assert.equal(
    extractDriveFileId('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs'),
    '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs'
  );
  assert.equal(extractDriveFileId(''), null);
});

test('extractDriveFolderId parses folder URLs and raw folder IDs', () => {
  assert.equal(
    extractDriveFolderId('https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz123456?usp=drive_link'),
    '1AbCdEfGhIjKlMnOpQrStUvWxYz123456'
  );
  assert.equal(
    extractDriveFolderId('1AbCdEfGhIjKlMnOpQrStUvWxYz123456'),
    '1AbCdEfGhIjKlMnOpQrStUvWxYz123456'
  );
});

test('buildDrivePreviewUrl generates embedded preview player link and never download link', () => {
  const url = buildDrivePreviewUrl('https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view');
  assert.equal(url, 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview');
  assert.ok(!url.includes('export=download'));
});

test('calculateProgressStats computes accurate overall and per-module percentages', () => {
  const modules = [
    { id: 'm1', code: '01', title: 'Fundamentos del Muay Thai' },
    { id: 'm2', code: '02', title: 'Técnicas de Puños' },
  ];
  const videos = [
    { id: 'v1', moduleId: 'm1' },
    { id: 'v2', moduleId: 'm1' },
    { id: 'v3', moduleId: 'm2' },
    { id: 'v4', moduleId: 'm2' },
  ];

  const stats = calculateProgressStats(['v1', 'v2', 'v3'], videos, modules);
  assert.equal(stats.completedCount, 3);
  assert.equal(stats.totalCount, 4);
  assert.equal(stats.percentage, 75);
  assert.equal(stats.byModule[0].percentage, 100);
  assert.equal(stats.byModule[1].percentage, 50);
});

test('canAccessBonus and canAccessVipClasses enforce ESENCIAL, COMPLETO, and VIP tiers', () => {
  const bonus1 = { id: 'b1', allowedPlans: ['COMPLETO', 'VIP'] as ('ESENCIAL' | 'COMPLETO' | 'VIP')[] };

  assert.equal(canAccessBonus({ role: 'student', plan: 'ESENCIAL' }, bonus1), false);
  assert.equal(
    canAccessBonus({ role: 'student', plan: 'ESENCIAL', unlockedBonusIds: ['b1'] }, bonus1),
    true
  );
  assert.equal(canAccessBonus({ role: 'student', plan: 'COMPLETO' }, bonus1), true);
  assert.equal(canAccessBonus({ role: 'admin', plan: 'ESENCIAL' }, bonus1), true);

  assert.equal(canAccessVipClasses({ role: 'student', plan: 'COMPLETO' }), false);
  assert.equal(canAccessVipClasses({ role: 'student', plan: 'VIP' }), true);
});

test('filterNonDuplicateDriveFiles removes already synced files and non-videos', () => {
  const incoming = [
    { id: 'file_101', name: '01_Postura_Guardia.mp4', mimeType: 'video/mp4' },
    { id: 'file_102', name: '02_Jab_Cross.mp4', mimeType: 'video/mp4' },
    { id: 'file_103', name: 'Notas.txt', mimeType: 'text/plain' },
  ];
  const result = filterNonDuplicateDriveFiles(incoming, ['file_101']);
  assert.equal(result.newFiles.length, 1);
  assert.equal(result.newFiles[0].id, 'file_102');
  assert.equal(result.skippedDuplicates.length, 1);
  assert.equal(result.skippedDuplicates[0].id, 'file_101');
});

test('generateSpanishBonusPdfBytes creates valid multi-page Spanish PDFs for all 5 bonuses', () => {
  const bonusIds = ['bono-01', 'bono-02', 'bono-03', 'bono-04', 'bono-05'];
  for (const id of bonusIds) {
    const manual = getSpanishBonusManual({
      id,
      code: id.toUpperCase(),
      title: '',
      description: '',
    });
    assert.equal(manual.chapters.length, 4);
    assert.ok(manual.introduction.length > 50);

    const pdfBytes = generateSpanishBonusPdfBytes({
      id,
      code: manual.code,
      title: manual.title,
      description: manual.subtitle,
    });
    const pdfText = new TextDecoder('latin1').decode(pdfBytes);
    assert.ok(pdfText.startsWith('%PDF-1.4'));
    assert.ok(pdfText.includes('/Count 5'));
    assert.ok(pdfText.trim().endsWith('%%EOF'));
  }
});

