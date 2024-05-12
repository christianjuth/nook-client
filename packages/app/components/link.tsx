import { Link as SolitoLink, TextLink } from "solito/link";
import { Href } from "expo-router/build/link/href";
import { useMemo } from "react";

export const Link = ({
  href,
  children,
  absolute,
  target,
  asText,
}: {
  href: Href;
  children: React.ReactNode;
  absolute?: boolean;
  target?: string;
  asText?: boolean;
}) => {
  const memoChildren = useMemo(() => children, [children]);

  if (asText) {
    return (
      <TextLink href={href} target={target}>
        {memoChildren}
      </TextLink>
    );
  }
  return (
    <SolitoLink href={href} target={target}>
      {memoChildren}
    </SolitoLink>
  );
};
