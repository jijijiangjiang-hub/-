import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import type { FrameItem } from './MainFrame';

const assetUrl = (fileName: string) => `${import.meta.env.BASE_URL}assets/${fileName}`;

const STUDY_LINES = [
  '教育背景',
  '乌克兰哈尔科夫国立师范大学',
  '经济学硕士  2022.06 - 2024.01',
  '宁波大学科学与技术学院',
  '工商管理本科（全日制）  2018.09 - 2020.06',
  '宁波城市职业技术学院',
  '金融大类（投资与理财）专科  2015.09 - 2018.06',
  '从金融、管理到经济学研究，再进入 AI 招聘与个人项目实践。',
];

const STUDY_ARCHIVES = [
  {
    mark: 'M.A.',
    title: '经济学硕士',
    meta: '哈尔科夫国立师范大学',
    years: '2022.06 - 2024.01',
  },
  {
    mark: 'B.B.A.',
    title: '工商管理本科',
    meta: '宁波大学科学与技术学院',
    years: '2018.09 - 2020.06',
  },
  {
    mark: 'FIN.',
    title: '投资与理财专科',
    meta: '宁波城市职业技术学院',
    years: '2015.09 - 2018.06',
  },
];

const WRITING_INTERVAL = 42;

function getVisibleLengthByLine(characterCount: number) {
  let remaining = characterCount;

  return STUDY_LINES.map((line) => {
    const visibleLength = Math.max(0, Math.min(line.length, remaining));
    remaining -= line.length + 1;
    return visibleLength;
  });
}

function getWritingPosition(characterCount: number) {
  let remaining = characterCount;

  for (let index = 0; index < STUDY_LINES.length; index += 1) {
    const line = STUDY_LINES[index];
    if (remaining <= line.length) {
      return {
        row: index,
        progress: line.length ? Math.max(0.04, remaining / line.length) : 0.04,
      };
    }

    remaining -= line.length + 1;
  }

  return { row: STUDY_LINES.length - 1, progress: 0.92 };
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

export default function StudyDetailPage({ item, onClose }: { item: FrameItem; onClose: () => void }) {
  const totalCharacters = useMemo(
    () => STUDY_LINES.reduce((sum, line) => sum + line.length + 1, 0),
    [],
  );
  const [writtenCharacters, setWrittenCharacters] = useState(0);

  useEffect(() => {
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
  }, [totalCharacters]);

  const visibleLengths = getVisibleLengthByLine(writtenCharacters);
  const writingPosition = getWritingPosition(writtenCharacters);
  const progress = writtenCharacters / totalCharacters;

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
        className="parchment-scroll parchment-book"
        initial={{ y: 44, opacity: 0, rotateX: 8 }}
        animate={{ y: 0, opacity: 1, rotateX: 0 }}
        exit={{ y: 30, opacity: 0, filter: 'blur(8px)' }}
        transition={{ duration: 0.78, ease: [0.16, 1, 0.3, 1] }}
      >
        <article className="parchment-page parchment-page-writing">
          <img src={assetUrl('parchment-paper.png')} alt="" className="parchment-paper-image" draggable={false} />
          <div className="parchment-inner">
            <div className="parchment-heading">
              <p>{item.title}</p>
              <h2>{item.subtitle}</h2>
              <span>Education Ledger</span>
            </div>

            <div
              className="study-writing-area"
              style={
                {
                  '--quill-row': writingPosition.row,
                  '--quill-progress': writingPosition.progress,
                } as CSSProperties
              }
            >
              {STUDY_LINES.map((line, index) => (
                <p key={line} className={index === 0 ? 'study-line study-line-title' : 'study-line'}>
                  {renderWritingLine(line, visibleLengths[index], index, writingPosition.row)}
                  {index === writingPosition.row && writtenCharacters < totalCharacters ? (
                    <span className="ink-caret" />
                  ) : null}
                </p>
              ))}

              <img
                key={writtenCharacters}
                src={assetUrl('quill-pen.png')}
                alt=""
                className={writtenCharacters >= totalCharacters ? 'quill-pen is-resting' : 'quill-pen'}
                draggable={false}
              />
            </div>
          </div>
        </article>

        <article className="parchment-page parchment-page-archive">
          <img src={assetUrl('parchment-paper.png')} alt="" className="parchment-paper-image" draggable={false} />
          <div className="parchment-inner">
            <div className="archive-heading">
              <p>Archive</p>
              <span>Studies</span>
            </div>

            <div className="study-archives" aria-label="学业档案摘要">
              {STUDY_ARCHIVES.map((archive, index) => (
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
          </div>
        </article>
      </motion.div>
    </motion.section>
  );
}
