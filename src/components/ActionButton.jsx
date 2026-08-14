import { C } from '../constants/colors';
import { useEnterKey } from '../hooks/useEnterKey';

export function ActionButton({
  label = 'Continuar',
  onClick,
  disabled = false,
  variant = 'teal',
  icon,
}) {
  useEnterKey(onClick ?? (() => {}), disabled);

  const bg =
    disabled              ? '#E5E7EB'     :
    variant === 'navy'    ? C.navy        :
    variant === 'outline' ? 'transparent' : C.teal;

  const textColor =
    disabled              ? '#9CA3AF' :
    variant === 'outline' ? C.navy    :
    variant === 'teal'    ? C.navy    : '#FFFFFF';

  return (
    <div
      style={{
        flexShrink: 0,
        padding: '14px 24px 24px',
        background: C.white,
        borderTop: `1px solid ${C.navyLight}`,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <button
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        style={{
          width: '100%',
          maxWidth: 320,
          padding: '16px 40px',
          borderRadius: 9999,
          background: bg,
          color: textColor,
          fontSize: 16,
          fontWeight: 700,
          border: variant === 'outline' ? `2px solid ${C.navy}` : 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          letterSpacing: '0.2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {icon && <span>{icon}</span>}
        {label}
      </button>
    </div>
  );
}
