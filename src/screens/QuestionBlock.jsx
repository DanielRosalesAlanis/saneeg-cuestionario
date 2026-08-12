import { useState, useEffect, useRef } from 'react';
import { C } from '../constants/colors';
import { Header } from '../components/Header';
import { ActionButton } from '../components/ActionButton';
import { OptionCard } from '../components/OptionCard';

const EXCLUSIVE_MULTI_VALUES = new Set(['Ninguno', 'Prefiero no decirlo']);

// El backend valida los mismos límites (BloqueValidator); replicarlos aquí
// evita que el usuario llegue hasta el guardado del bloque para enterarse
// de que su respuesta es inválida.
function isValidTextAnswer(question, val) {
  if (val === undefined || val === null || val === '') return false;
  const text = String(val).trim();
  if (question.inputMode === 'numeric') {
    if (!/^\d{1,3}$/.test(text)) return false;
    const n = Number(text);
    if (question.min !== undefined && n < question.min) return false;
    if (question.max !== undefined && n > question.max) return false;
    return true;
  }
  if (question.minLength !== undefined && text.length < question.minLength) return false;
  if (question.maxLength !== undefined && text.length > question.maxLength) return false;
  return true;
}

function ScaleQuestion({ question, value, onChange }) {
  const min = question.min ?? 1;
  const max = question.max ?? 5;
  const current = value ?? min;
  const nodes = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  const pct = ((current - min) / (max - min)) * 100;

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <span style={{ fontSize: 48, fontWeight: 800, color: C.navy, lineHeight: 1 }}>{current}</span>
        <span style={{ fontSize: 18, color: C.muted, fontWeight: 500 }}> / {max}</span>
      </div>

      <div style={{
        position: 'relative', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 16, height: 40,
      }}>
        <div style={{
          position: 'absolute', left: 18, right: 18, top: '50%',
          height: 3, background: C.border, borderRadius: 2, transform: 'translateY(-50%)',
        }} />
        <div style={{
          position: 'absolute', left: 18, top: '50%', height: 3,
          background: C.navy, borderRadius: 2, transform: 'translateY(-50%)',
          width: `${pct}%`, maxWidth: 'calc(100% - 36px)', transition: 'width 0.2s ease',
        }} />
        {nodes.map(n => {
          const active = n === current;
          const passed = n <= current;
          return (
            <button
              key={n}
              onClick={() => onChange(n)}
              aria-label={`Valor ${n}`}
              style={{
                position: 'relative', zIndex: 1,
                width: active ? 34 : 28, height: active ? 34 : 28,
                borderRadius: '50%',
                border: `2px solid ${passed ? C.navy : C.border}`,
                background: passed ? C.navy : C.white,
                color: passed ? C.white : C.muted,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: active ? '0 4px 12px rgba(13,27,42,0.25)' : 'none',
                flexShrink: 0,
              }}
            >
              {n}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 12, color: C.muted, fontWeight: 500, maxWidth: 90 }}>
          {question.minLabel ?? 'Nada satisfecho'}
        </span>
        {nodes.length >= 5 && (
          <span style={{ fontSize: 12, color: C.muted, fontWeight: 500, textAlign: 'center' }}>
            {question.midLabel ?? 'Medio satisfecho'}
          </span>
        )}
        <span style={{ fontSize: 12, color: C.muted, fontWeight: 500, maxWidth: 90, textAlign: 'right' }}>
          {question.maxLabel ?? 'Totalmente satisfecho'}
        </span>
      </div>
    </div>
  );
}

function TextQuestion({ question, value, onChange }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <input
      ref={ref}
      type={question.inputType ?? (question.inputMode === 'numeric' ? 'number' : 'text')}
      inputMode={question.inputMode}
      placeholder={question.ph ?? 'Tu respuesta'}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      readOnly={question.prefilled}
      style={{
        width: '100%',
        padding: '15px 16px',
        borderRadius: 10,
        border: `1.5px solid ${value ? C.navy : C.border}`,
        fontSize: 16,
        color: C.text,
        outline: 'none',
        background: question.prefilled ? C.navyLight : C.surface,
        transition: 'border-color 0.2s',
      }}
      onFocus={e => { if (!question.prefilled) e.target.style.borderColor = C.teal; }}
      onBlur={e => { e.target.style.borderColor = value ? C.navy : C.border; }}
    />
  );
}

export function QuestionBlock({
  questions,
  data,
  setData,
  pctStart,
  pctEnd,
  onFinish,
  onBack,
  blockIndex,
  totalBlocks,
}) {
  const [idx, setIdx] = useState(0);
  const q   = questions[idx];
  const val = data[q.id];

  const listRef = useRef(null);
  const [atBottom, setAtBottom] = useState(false);

  const progress = pctStart + (idx / questions.length) * (pctEnd - pctStart);

  const isAnswered =
    q.type === 'multi' ? val && val.length > 0 :
    q.type === 'slider' ? val !== undefined :
    q.type === 'text' ? isValidTextAnswer(q, val) :
    val !== undefined && val !== '';

  function setSingle(v) { setData({ [q.id]: v }); }
  function toggleMulti(v) {
    const cur = data[q.id] ?? [];
    if (EXCLUSIVE_MULTI_VALUES.has(v)) {
      setData({ [q.id]: cur.includes(v) ? [] : [v] });
      return;
    }
    const compatibles = cur.filter(item => !EXCLUSIVE_MULTI_VALUES.has(item));
    setData({
      [q.id]: compatibles.includes(v)
        ? compatibles.filter(item => item !== v)
        : [...compatibles, v],
    });
  }

  function goNext() {
    if (idx < questions.length - 1) setIdx(i => i + 1);
    else onFinish();
  }

  function goBack() {
    if (idx > 0) setIdx(i => i - 1);
    else onBack?.();
  }

  const needsScroll = q.opts && q.opts.length > 4;

  function checkScroll() {
    const el = listRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 8);
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const el = listRef.current;
      setAtBottom(Boolean(
        needsScroll && el && el.scrollHeight - el.scrollTop - el.clientHeight < 8,
      ));
    });
    return () => cancelAnimationFrame(frame);
  }, [idx, needsScroll]);

  return (
    <div
      key={q.id}
      className="anim-slide"
      style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
    >
      <Header progress={progress} onBack={goBack} />

      <div
        style={{
          flex: 1, minHeight: 0, padding: '20px 24px 0',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        {/* Block pill */}
        {blockIndex && (
          <div style={{
            flexShrink: 0,
            display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 20, background: C.navyLight,
            marginBottom: 14,
          }}>
            <span style={{ fontSize: 12, color: C.navy, fontWeight: 700, letterSpacing: '0.3px', opacity: 0.7 }}>
              BLOQUE {blockIndex} DE {totalBlocks}
            </span>
          </div>
        )}

        <h1 style={{
          flexShrink: 0,
          fontSize: 19,
          fontWeight: 700,
          color: C.navy,
          lineHeight: 1.45,
          letterSpacing: '-0.2px',
          marginBottom: 18,
        }}>
          {q.text}
        </h1>

        {/* Single / Multi choice — grouped into a bordered scroll box when >4 opts */}
        {(q.type === 'single' || q.type === 'multi') && (
          <div style={{
            position: 'relative',
            flex: 1,
            minHeight: 0,
            maxHeight: needsScroll ? 380 : 'none',
            width: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            ...(needsScroll ? {
              border: `1.5px solid ${C.navy}`,
              borderRadius: 16,
              padding: 10,
            } : {}),
          }}>
            <div
              ref={listRef}
              onScroll={needsScroll ? checkScroll : undefined}
              className={needsScroll ? 'scroll-box' : undefined}
              style={{
                flex: needsScroll ? 1 : 'none',
                minHeight: 0,
                width: '100%',
                boxSizing: 'border-box',
                overflowY: needsScroll ? 'auto' : 'visible',
                overflowX: 'hidden',
                overscrollBehavior: 'contain',
                paddingTop: 6,
                paddingRight: needsScroll ? 10 : 0,
                paddingLeft: 2,
                paddingBottom: needsScroll ? 4 : 8,
              }}
            >
              {q.opts.map((opt, i) => (
                <OptionCard
                  key={i}
                  label={opt}
                  multi={q.type === 'multi'}
                  selected={
                    q.type === 'multi'
                      ? (val ?? []).includes(opt)
                      : val === opt
                  }
                  onClick={() =>
                    q.type === 'multi' ? toggleMulti(opt) : setSingle(opt)
                  }
                />
              ))}
            </div>

            {needsScroll && !atBottom && (
              <div style={{
                position: 'absolute', left: 10, right: 10, bottom: 10, height: 32,
                borderRadius: '0 0 14px 14px',
                background: 'linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0))',
                pointerEvents: 'none',
              }} />
            )}
          </div>
        )}

        {/* Text input */}
        {q.type === 'text' && (
          <div style={{ overflowY: 'auto', minHeight: 0 }}>
            <TextQuestion question={q} value={val} onChange={setSingle} />
            {val !== undefined && val !== '' && !isValidTextAnswer(q, val) && (
              <p style={{ fontSize: 13, color: C.error, marginTop: 8 }}>
                {q.inputMode === 'numeric'
                  ? `Ingresa un número entre ${q.min ?? 0} y ${q.max ?? 999}.`
                  : `Escribe al menos ${q.minLength} caracteres.`}
              </p>
            )}
          </div>
        )}

        {/* Scale (1–5 node timeline) */}
        {q.type === 'slider' && (
          <div style={{ overflowY: 'auto', minHeight: 0 }}>
            <ScaleQuestion question={q} value={val} onChange={setSingle} />
          </div>
        )}

        <div style={{ height: 16, flexShrink: 0 }} />
      </div>

      <ActionButton label="Continuar" onClick={goNext} disabled={!isAnswered} />
    </div>
  );
}
