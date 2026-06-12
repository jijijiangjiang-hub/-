import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DETAIL_CONTENT,
  SOCIAL_LINKS,
  getGalleryPages,
} from '../src/data/detailContent.ts';

const getContentByArchiveLabel = (label) => {
  const content = Object.values(DETAIL_CONTENT).find((item) => item.archiveLabel === label);

  assert.ok(content, `Expected content with archive label: ${label}`);
  return content;
};

test('life gallery is grouped two photos per parchment page', () => {
  const content = getContentByArchiveLabel('Life');
  const pages = getGalleryPages(content.gallery);

  assert.equal(content.gallery.length, 5);
  assert.deepEqual(
    pages.map((page) => page.length),
    [2, 2, 1],
  );
});

test('life gallery marks the third photo as portrait-oriented', () => {
  const content = getContentByArchiveLabel('Life');

  assert.equal(content.gallery[2].src, 'life-dog-closeup.jpg');
  assert.equal(content.gallery[2].orientation, 'portrait');
});

test('career detail page uses the scroll reveal experiment', () => {
  const careerContent = getContentByArchiveLabel('Career');

  assert.equal(careerContent.revealMode, 'scroll');
});

test('social page exposes placeholder contact buttons for later links', () => {
  const socialContent = getContentByArchiveLabel('Social');

  assert.deepEqual(
    SOCIAL_LINKS.map((link) => link.id),
    ['linkedin', 'xiaohongshu', 'x', 'email'],
  );
  assert.equal(SOCIAL_LINKS.every((link) => link.label && link.href), true);
  assert.equal(socialContent.socialLinks, SOCIAL_LINKS);
});
