import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, MouseEvent, ReactNode, UIEvent } from 'react';
import { motion } from 'framer-motion';
import {
  DETAIL_CONTENT,
  getGalleryPages,
  type GalleryImage,
  type SocialLink,
} from '../data/detailContent';
import { getScrollLineFocusState } from '../utils/scrollFocus';
import type { FrameItem } from './MainFrame';

const assetUrl = (fileName: string) => `${import.meta.env.BASE_URL}assets/${fileName}`;
const WRITING_INTERVAL = 42;

function getVisibleLengthByLine(lines: string[], characterCount: number) {
  let remaining = characterCount;

  return lines.map((line) => {
    const visibleLength = Math.max(0, Math.min(line.length, remaining));
    remaining -= line.length + 1;
    return visibleLength;
  });
}

function getWritingPosition(lines: string[], characterCount: number) {
  let remaining = characterCount;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (remaining <= line.length) {
      return {
        row: index,
        progress: line.length ? Math.max(0.04, remaining / line.length) : 0.04,
      };
    }

    remaining -= line.length + 1;
  }

  return { row: lines.length - 1, progress: 0.92 };
}

function renderWritingLine(line: string, visibleLength: number, rowIndex: number, activeRow: number) {
  return line.slice(0, visibleLength).split('').map((char, charIndex) => {
    const isCurrentGlyph = rowIndex === activeRow && charIndex === visibleLength - 1;

    return (
      <span
        key={`${rowIndex}-${charIndex}-${char}`}
        className={isCurrentGlyph ? 'writing-glyph is-current' : 'writing-glyph'}
      >
        {char === ' ' ? '\u00a0' : char}
      </span>
    );
  });
}

function ParchmentPaper({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <article className={['parchment-page', className].filter(Boolean).join(' ')}>
      <img src={assetUrl('parchment-paper.png')} alt="" className="parchment-paper-image" draggable={false} />
      <div className="parchment-inner">{children}</div>
    </article>
  );
}

function GalleryPage({
  images,
  index,
  total,
}: {
  images: GalleryImage[];
  index: number;
  total: number;
}) {
  const hasPortrait = images.some((image) => image.orientation === 'portrait');

  return (
    <ParchmentPaper className="parchment-page-gallery">
      <div className="archive-heading life-gallery-heading">
        <p>Gallery</p>
        <span>
          Life {index + 1} / {total}
        </span>
      </div>

      <div
        className={[
          'life-gallery-page',
          images.length === 1 ? 'is-single' : '',
          hasPortrait ? 'has-portrait' : '',
        ].filter(Boolean).join(' ')}
      >
        {images.map((image) => (
          <figure
            key={image.src}
            className={[
              'life-gallery-item',
              image.orientation === 'portrait' ? 'is-portrait' : '',
            ].filter(Boolean).join(' ')}
          >
            <img src={assetUrl(image.src)} alt={image.alt} draggable={false} />
          </figure>
        ))}
      </div>
    </ParchmentPaper>
  );
}

function SocialLinks({ links, progress }: { links: SocialLink[]; progress: number }) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>, link: SocialLink) => {
    if (link.isPlaceholder) {
      event.preventDefault();
    }
  };

  return (
    <div className="social-link-list" aria-label="社交平台入口">
      {links.map((link, index) => (
        <motion.a
          key={link.id}
          className={progress > 0.28 + index * 0.12 ? 'social-link-button is-revealed' : 'social-link-button'}
          href={link.href}
          onClick={(event) => handleClick(event, link)}
          target={link.isPlaceholder ? undefined : '_blank'}
          rel={link.isPlaceholder ? undefined : 'noreferrer'}
          initial={false}
          animate={{
            opacity: progress > 0.28 + index * 0.12 ? 1 : 0,
            y: progress > 0.28 + index * 0.12 ? 0 : 18,
            filter: progress > 0.28 + index * 0.12 ? 'blur(0px)' : 'blur(8px)',
          }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          aria-label={`${link.label}入口`}
        >
          <span>{link.label}</span>
          <small>{link.meta}</small>
        </motion.a>
      ))}
    </div>
  );
}

export default function StudyDetailPage({ item, onClose }: { item: FrameItem; onClose: () => void }) {
  const content = DETAIL_CONTENT[item.label] ?? DETAIL_CONTENT['我的学业'];
  const isScrollReveal = content.revealMode === 'scroll';
  const totalCharacters = useMemo(
    () => content.lines.reduce((sum, line) => sum + line.length + 1, 0),
    [content.lines],
  );
  const galleryPages = useMemo(() => getGalleryPages(content.gallery), [content.gallery]);
  const [writtenCharacters, setWrittenCharacters] = useState(0);
  const [scrollRevealProgress, setScrollRevealProgress] = useState(0);

  useEffect(() => {
    if (isScrollReveal) return undefined;

    const timer = window.setInterval(() => {
      setWrittenCharacters((current) => {
        if (current >= totalCharacters) {
          window.clearInterval(timer);
          return current;
        }

        return current + 1;
      });
    }, WRITING_INTERVAL);

    return () => window.clearInterval(timer);
  }, [isScrollReveal, totalCharacters]);

  const handleBookScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!isScrollReveal) return;

    const target = event.currentTarget;
    const maxScroll = target.scrollHeight - target.clientHeight;
    setScrollRevealProgress(maxScroll > 0 ? target.scrollTop / maxScroll : 0);
  };

  const effectiveWrittenCharacters = isScrollReveal ? totalCharacters : writtenCharacters;
  const visibleLengths = getVisibleLengthByLine(content.lines, effectiveWrittenCharacters);
  const writingPosition = getWritingPosition(content.lines, effectiveWrittenCharacters);
  const progress = isScrollReveal ? scrollRevealProgress : writtenCharacters / totalCharacters;

  return (
    <motion.section
      className="detail-page study-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      style={{ '--detail-accent': item.accent } as CSSProperties}
    >
      <img src={assetUrl('main-bg.png')} alt="" className="detail-bg study-detail-bg" draggable={false} />
      <div className="detail-scrim study-scrim" />

      <button type="button" className="detail-back study-back" onClick={onClose}>
        返回
      </button>

      <motion.div
        className={isScrollReveal ? 'parchment-scroll parchment-book is-scroll-experiment' : 'parchment-scroll parchment-book'}
        onScroll={handleBookScroll}
        initial={{ y: 44, opacity: 0, rotateX: 8 }}
        animate={{ y: 0, opacity: 1, rotateX: 0 }}
        exit={{ y: 30, opacity: 0, filter: 'blur(8px)' }}
        transition={{ duration: 0.78, ease: [0.16, 1, 0.3, 1] }}
      >
        <ParchmentPaper className={isScrollReveal ? 'parchment-page-writing parchment-page-scroll-writing' : 'parchment-page-writing'}>
          <div className="parchment-heading">
            <p>{item.title}</p>
            <h2>{item.subtitle}</h2>
            <span>{content.ledger}</span>
          </div>

          <div
            className={isScrollReveal ? 'study-writing-area career-scroll-writing' : 'study-writing-area'}
            style={
              {
                '--quill-row': writingPosition.row,
                '--quill-progress': writingPosition.progress,
              } as CSSProperties
            }
          >
            {content.lines.map((line, index) => {
              if (isScrollReveal) {
                const lineFocus = getScrollLineFocusState(index, content.lines.length, scrollRevealProgress);

                return (
                  <p
                    key={line}
                    className={[
                      'study-line',
                      index === 0 ? 'study-line-title' : '',
                      'career-scroll-line',
                      lineFocus.isFocusLine ? 'is-focus-line' : '',
                    ].filter(Boolean).join(' ')}
                    style={{
                      '--line-emphasis': lineFocus.emphasis,
                      opacity: lineFocus.opacity,
                      transform: `translateY(${lineFocus.translateY}px) scale(${lineFocus.scale})`,
                      filter: `blur(${lineFocus.blur}px)`,
                      fontWeight: lineFocus.fontWeight,
                    } as CSSProperties}
                  >
                    {line}
                  </p>
                );
              }

              return (
                <p key={line} className={index === 0 ? 'study-line study-line-title' : 'study-line'}>
                  {renderWritingLine(line, visibleLengths[index], index, writingPosition.row)}
                  {index === writingPosition.row && writtenCharacters < totalCharacters ? (
                    <span className="ink-caret" />
                  ) : null}
                </p>
              );
            })}

            {isScrollReveal ? null : (
              <img
                key={writtenCharacters}
                src={assetUrl('quill-pen.png')}
                alt=""
                className={writtenCharacters >= totalCharacters ? 'quill-pen is-resting' : 'quill-pen'}
                draggable={false}
              />
            )}
          </div>
        </ParchmentPaper>

        <ParchmentPaper className="parchment-page-archive">
          <div className="archive-heading">
            <p>{content.archiveTitle}</p>
            <span>{content.archiveLabel}</span>
          </div>

          {content.socialLinks ? (
            <SocialLinks links={content.socialLinks} progress={progress} />
          ) : (
            <div className="study-archives" aria-label={`${item.label}档案摘要`}>
              {content.archives.map((archive, index) => (
                <motion.article
                  key={archive.title}
                  className={progress > 0.28 + index * 0.16 ? 'study-archive is-revealed' : 'study-archive'}
                  initial={false}
                  animate={{
                    opacity: progress > 0.28 + index * 0.16 ? 1 : 0,
                    y: progress > 0.28 + index * 0.16 ? 0 : 18,
                    filter: progress > 0.28 + index * 0.16 ? 'blur(0px)' : 'blur(8px)',
                  }}
                  transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="archive-seal">{archive.mark}</div>
                  <div>
                    <h3>{archive.title}</h3>
                    <p>{archive.meta}</p>
                    <span>{archive.years}</span>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </ParchmentPaper>

        {galleryPages.map((page, index) => (
          <GalleryPage key={`gallery-${index}`} images={page} index={index} total={galleryPages.length} />
        ))}
      </motion.div>
    </motion.section>
  );
}
