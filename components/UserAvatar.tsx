// Colors chosen to guarantee WCAG AA contrast ratio (≥4.5:1) with white text.
const PALETTE = [
  '#7c3aed',
  '#b91c1c',
  '#b45309',
  '#047857',
  '#2563eb',
  '#be185d',
  '#4f46e5',
  '#0f766e',
];

function hashToIndex(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % PALETTE.length;
}

function getInitials(name: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0]?.toUpperCase() || '?';
}

const UserAvatar = ({
  name,
  image,
  userId,
  size = 30,
}: {
  name: string | null;
  image: string | null;
  userId?: string;
  size?: number;
}) => {
  if (image) {
    return (
      <img
        src={image}
        alt={name || ''}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  const bg = PALETTE[hashToIndex(userId || name || '')];
  const initials = getInitials(name);

  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold select-none"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        backgroundColor: bg,
      }}
      role="img"
      aria-label={name || 'Avatar'}
    >
      <span aria-hidden="true">{initials}</span>
    </div>
  );
};

export default UserAvatar;
