import React from 'react';
import styled from 'styled-components';

const PALETTE = [
  '#8b5cf6',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#ec4899',
  '#6366f1',
  '#14b8a6',
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
      {initials}
    </InitialsCircle>
  );
};

export default UserAvatar;
