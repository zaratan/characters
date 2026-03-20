import styled from 'styled-components';

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

const Img = styled.img<{ $size: number }>`
  height: ${(props) => props.$size}px;
  width: ${(props) => props.$size}px;
  border-radius: 50%;
  object-fit: cover;
`;

const InitialsCircle = styled.div<{ $size: number; $bg: string }>`
  height: ${(props) => props.$size}px;
  width: ${(props) => props.$size}px;
  border-radius: 50%;
  background-color: ${(props) => props.$bg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: ${(props) => props.$size * 0.4}px;
  font-weight: 600;
  user-select: none;
`;

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
    return <Img src={image} alt={name || ''} $size={size} />;
  }

  const bg = PALETTE[hashToIndex(userId || name || '')];
  const initials = getInitials(name);

  return (
    <InitialsCircle
      $size={size}
      $bg={bg}
      role="img"
      aria-label={name || 'Avatar'}
    >
      <span aria-hidden="true">{initials}</span>
    </InitialsCircle>
  );
};

export default UserAvatar;
