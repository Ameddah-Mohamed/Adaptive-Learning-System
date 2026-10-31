import React, { useState } from 'react';
import katex from 'katex';
import { Check, Copy } from 'lucide-react';
import { cn, copyText } from '../lib/utils';

interface MathRendererProps {
  content: string;
  className?: string;
  streaming?: boolean;
}

const PYTHON_KEYWORDS = new Set([
  'def', 'class', 'return', 'if', 'else', 'elif', 'for', 'while', 'in', 'not', 'and', 'or', 'import', 'from', 'as',
  'try', 'except', 'finally', 'with', 'lambda', 'yield', 'pass', 'break', 'continue', 'raise', 'assert', 'global',
  'nonlocal', 'is', 'None', 'True', 'False', 'async', 'await', 'del',
]);

const JS_KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'import', 'from', 'export', 'default',
  'class', 'extends', 'new', 'async', 'await', 'try', 'catch', 'finally', 'throw', 'typeof', 'instanceof', 'null',
  'undefined', 'true', 'false', 'interface', 'type', 'as', 'in', 'of',
]);

function renderMath(math: string, displayMode: boolean) {
  try {
    return {
      __html: katex.renderToString(math, {
        displayMode,
        throwOnError: false,
        output: 'htmlAndMathml',
        strict: false,
      }),
    };
  } catch {
    return { __html: math };
  }
}

function highlight(code: string, language: string): React.ReactNode {
  const lang = language.toLowerCase();
  const keywords = lang.startsWith('py') ? PYTHON_KEYWORDS : lang.startsWith('js') || lang.startsWith('ts') ? JS_KEYWORDS : new Set<string>();
  const allowHashComment = ['python', 'py', 'bash', 'sh', 'shell', 'yaml', 'toml', 'r'].includes(lang);
  const pattern = new RegExp(
    [
      allowHashComment ? '#[^\\n]*' : '\\/\\/[^\\n]*',
      '\\/\\*[\\s\\S]*?\\*\\/',
      '"""[\\s\\S]*?"""',
      "'''[\\s\\S]*?'''",
      '"(?:\\\\.|[^"\\\\])*"',
      "'(?:\\\\.|[^'\\\\])*'",
      '`(?:\\\\.|[^`\\\\])*`',
      '\\b\\d+(?:\\.\\d+)?\\b',
      '[A-Za-z_][A-Za-z0-9_]*(?=\\s*\\()',
      '[A-Za-z_][A-Za-z0-9_]*',
    ].join('|'),
    'g',
  );

  const nodes: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(code)) !== null) {
    if (match.index > last) nodes.push(code.slice(last, match.index));
    const token = match[0];
    let color = 'text-[#c9c9d4]';

    if (token.startsWith('#') || token.startsWith('//') || token.startsWith('/*')) color = 'text-[#5f6072]';
    else if (token.startsWith('"') || token.startsWith("'") || token.startsWith('`')) color = 'text-[#9ecfa0]';
    else if (/^\d/.test(token)) color = 'text-[#e3b07a]';
    else if (keywords.has(token)) color = 'text-[#9a97ff]';
    else if (code[match.index + token.length] === '(') color = 'text-[#7dd3fc]';

    nodes.push(
      <span key={`tok-${key++}`} className={color}>
        {token}
      </span>,
    );
    last = match.index + token.length;
  }
  if (last < code.length) nodes.push(code.slice(last));
  return nodes;
}

const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);
  const label = language || 'text';

  const onCopy = async () => {
    const ok = await copyText(code.replace(/\n$/, ''));
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="group/code my-4 overflow-hidden rounded-xl border border-line bg-[#0b0b0f]">
      <div className="flex items-center justify-between border-b border-line bg-[#101015] px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span className="flex gap-1" aria-hidden>
            <span className="h-1.5 w-1.5 rounded-full bg-[#34343d]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#34343d]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#34343d]" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-subtle">{label}</span>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="focus-ring flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[10px] text-subtle transition-colors hover:bg-white/5 hover:text-muted"
          aria-label={copied ? 'Code copied' : 'Copy code'}
        >
          {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[12.5px] leading-[1.7] text-[#c9c9d4]">
        <code>{highlight(code.replace(/\n$/, ''), language)}</code>
      </pre>
    </div>
  );
};

const MathBlock: React.FC<{ math: string }> = ({ math }) => {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    const ok = await copyText(math);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="group/math relative my-3">
      <div
        className="overflow-x-auto rounded-[10px] border border-line bg-[#0c0c10] px-4 py-[0.9em]"
        dangerouslySetInnerHTML={renderMath(math, true)}
      />
      <button
        type="button"
        onClick={onCopy}
        className="focus-ring absolute right-2 top-2 flex h-6 items-center gap-1 rounded-md border border-line bg-surface2/90 px-1.5 text-[9px] text-subtle opacity-0 transition-opacity group-hover/math:opacity-100 focus-visible:opacity-100"
        aria-label="Copy equation"
      >
        {copied ? <Check className="h-2.5 w-2.5 text-success" /> : <Copy className="h-2.5 w-2.5" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
};

function InlineContent({ text }: { text: string }) {
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*|__[^_]+__|_[^_\n]+_|`[^`\n]+`|\$[^$\n]+?\$|\\\(.+?\\\)|\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {tokens.map((token, index) => {
        if (!token) return null;
        if (token.startsWith('**') && token.endsWith('**')) {
          return <strong key={index}>{token.slice(2, -2)}</strong>;
        }
        if (token.startsWith('__') && token.endsWith('__')) {
          return <strong key={index}>{token.slice(2, -2)}</strong>;
        }
        if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
          return <em key={index}>{token.slice(1, -1)}</em>;
        }
        if (token.startsWith('_') && token.endsWith('_') && token.length > 2) {
          return <em key={index}>{token.slice(1, -1)}</em>;
        }
        if (token.startsWith('`') && token.endsWith('`')) {
          return <code key={index}>{token.slice(1, -1)}</code>;
        }
        if (token.startsWith('$') && token.endsWith('$')) {
          return (
            <span
              key={index}
              className="mx-0.5 inline-block align-baseline"
              dangerouslySetInnerHTML={renderMath(token.slice(1, -1).trim(), false)}
            />
          );
        }
        if (token.startsWith('\\(') && token.endsWith('\\)')) {
          return (
            <span
              key={index}
              className="mx-0.5 inline-block align-baseline"
              dangerouslySetInnerHTML={renderMath(token.slice(2, -2).trim(), false)}
            />
          );
        }
        const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          return (
            <a key={index} href={link[2]} target="_blank" rel="noreferrer noopener">
              {link[1]}
            </a>
          );
        }
        return <React.Fragment key={index}>{token}</React.Fragment>;
      })}
    </>
  );
}

function MarkdownBlocks({ text }: { text: string }) {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let index = 0;

  const isBlockStart = (line: string) =>
    /^\s*$/.test(line) ||
    /^#{1,6}\s/.test(line) ||
    /^\s*[-*+]\s/.test(line) ||
    /^\s*\d+[.)]\s/.test(line) ||
    /^>\s?/.test(line) ||
    /^\s*\|.*\|\s*$/.test(line) ||
    /^\s*(---|\*\*\*|___)\s*$/.test(line);

  while (index < lines.length) {
    const line = lines[index];

    if (/^\s*$/.test(line)) {
      index += 1;
      continue;
    }

    if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) {
      blocks.push(<hr key={`hr-${index}`} />);
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const HeadingTag = (`h${Math.min(level, 4)}`) as keyof JSX.IntrinsicElements;
      blocks.push(
        React.createElement(HeadingTag, { key: `h-${index}` }, <InlineContent text={heading[2]} />),
      );
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^>\s?/, ''));
        index += 1;
      }
      blocks.push(
        <blockquote key={`quote-${index}`}>
          <InlineContent text={quote.join(' ')} />
        </blockquote>,
      );
      continue;
    }

    if (/^\s*[-*+]\s/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*[-*+]\s/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*+]\s/, ''));
        index += 1;
      }
      blocks.push(
        <ul key={`ul-${index}`}>
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>
              <InlineContent text={item} />
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\s*\d+[.)]\s/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*\d+[.)]\s/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+[.)]\s/, ''));
        index += 1;
      }
      blocks.push(
        <ol key={`ol-${index}`}>
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>
              <InlineContent text={item} />
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    if (/^\s*\|.*\|\s*$/.test(line)) {
      const tableLines: string[] = [];
      while (index < lines.length && /^\s*\|.*\|\s*$/.test(lines[index])) {
        tableLines.push(lines[index].trim());
        index += 1;
      }
      if (tableLines.length >= 2 && /^\|?\s*:?-{3,}/.test(tableLines[1])) {
        const splitRow = (row: string) => row.replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
        const headers = splitRow(tableLines[0]);
        const rows = tableLines.slice(2).map(splitRow);
        blocks.push(
          <table key={`table-${index}`}>
            <thead>
              <tr>{headers.map((header, headerIndex) => <th key={headerIndex}><InlineContent text={header} /></th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => <td key={cellIndex}><InlineContent text={cell} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>,
        );
      } else {
        blocks.push(
          <p key={`table-text-${index}`}>
            <InlineContent text={tableLines.join(' ')} />
          </p>,
        );
      }
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length && !isBlockStart(lines[index])) {
      paragraph.push(lines[index]);
      index += 1;
    }
    // Safety: avoid stalling on a line that only matched a block-start pattern we did not consume
    if (paragraph.length === 0) {
      paragraph.push(lines[index]);
      index += 1;
    }
    const textValue = paragraph.join(' ').replace(/\s{2,}/g, ' ').trim();
    if (textValue) {
      blocks.push(
        <p key={`p-${index}`}>
          <InlineContent text={textValue} />
        </p>,
      );
    }
  }

  return <>{blocks}</>;
}

function parseContent(content: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const blockRegex = /```([a-zA-Z0-9_+.-]*)\r?\n([\s\S]*?)```|\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let partIndex = 0;

  while ((match = blockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index);
      parts.push(
        <div key={`md-${partIndex++}`} className="contents">
          <MarkdownBlocks text={text} />
        </div>,
      );
    }
    if (match[1] !== undefined) {
      parts.push(<CodeBlock key={`code-${partIndex++}`} language={match[1] || 'text'} code={match[2]} />);
    } else if (match[3] !== undefined) {
      parts.push(<MathBlock key={`math-${partIndex++}`} math={(match[3] || '').trim()} />);
    } else if (match[4] !== undefined) {
      parts.push(<MathBlock key={`math-${partIndex++}`} math={(match[4] || '').trim()} />);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(
      <div key={`md-${partIndex++}`} className="contents">
        <MarkdownBlocks text={content.slice(lastIndex)} />
      </div>,
    );
  }

  return parts;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className, streaming }) => {
  const parsed = React.useMemo(() => parseContent(content), [content]);
  return (
    <div className={cn('prose-ensia', className)}>
      {parsed}
      {streaming && <span className="stream-caret" aria-hidden />}
    </div>
  );
};
