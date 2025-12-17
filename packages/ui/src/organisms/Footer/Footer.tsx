import { type Ref } from "react";
import {
  Twitter,
  Github,
  Linkedin,
  Youtube,
  Facebook,
  Instagram,
  type IconProps,
} from "../../atoms/Icon";
import { cn } from "../../utils";

// ============================================================================
// Types
// ============================================================================

export type SocialPlatform =
  | "twitter"
  | "github"
  | "linkedin"
  | "youtube"
  | "facebook"
  | "instagram";

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  /** Children (composition pattern) */
  children?: React.ReactNode;
  ref?: Ref<HTMLElement>;
}

export interface FooterBrandProps {
  /** Logo element */
  logo?: React.ReactNode;
  /** Logo text (used if logo not provided) */
  logoText?: string;
  /** Tagline text */
  tagline?: string;
  /** Children (social links or other content) */
  children?: React.ReactNode;
  className?: string;
}

export interface FooterColumnProps {
  /** Column title */
  title: string;
  /** Column links */
  children: React.ReactNode;
  className?: string;
}

export interface FooterLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  /** Link label */
  children: React.ReactNode;
  /** Link href */
  href: string;
}

export interface FooterSocialLinksProps {
  /** Social link children */
  children: React.ReactNode;
  className?: string;
}

export interface FooterSocialLinkProps {
  /** Social platform */
  platform: SocialPlatform;
  /** Link href */
  href: string;
  className?: string;
}

export interface FooterCopyrightProps {
  /** Copyright text */
  children: React.ReactNode;
  className?: string;
}

export interface FooterCustomProps {
  /** Custom content */
  children: React.ReactNode;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const socialIcons: Record<SocialPlatform, React.ComponentType<IconProps>> = {
  twitter: Twitter,
  github: Github,
  linkedin: Linkedin,
  youtube: Youtube,
  facebook: Facebook,
  instagram: Instagram,
};

// ============================================================================
// Components
// ============================================================================

// Footer.Brand
function Brand({ logo, logoText = "PLUXITY", tagline, children, className }: FooterBrandProps) {
  return (
    <div className={cn("lg:col-span-2", className)}>
      <div className="mb-4 flex items-center gap-2">
        {logo || <span className="text-xl font-bold text-brand">{logoText}</span>}
      </div>
      {tagline && <p className="mb-4 max-w-xs text-sm text-[#666673]">{tagline}</p>}
      {children}
    </div>
  );
}

// Footer.Column
function Column({ title, children, className }: FooterColumnProps) {
  return (
    <div className={className}>
      <h4 className="mb-4 text-sm font-bold text-[#333340]">{title}</h4>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

// Footer.Link
function Link({ children, href, className, ...props }: FooterLinkProps) {
  return (
    <li>
      <a
        href={href}
        className={cn("text-sm text-[#666673] transition-colors hover:text-brand", className)}
        {...props}
      >
        {children}
      </a>
    </li>
  );
}

// Footer.SocialLinks
function SocialLinks({ children, className }: FooterSocialLinksProps) {
  return <div className={cn("flex gap-4", className)}>{children}</div>;
}

// Footer.SocialLink
function SocialLink({ platform, href, className }: FooterSocialLinkProps) {
  const Icon = socialIcons[platform];
  return (
    <a
      href={href}
      className={cn("text-[#808088] transition-colors hover:text-brand", className)}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Icon size="md" />
    </a>
  );
}

// Footer.Copyright
function Copyright({ children, className }: FooterCopyrightProps) {
  return (
    <div className={cn("mt-12 border-t border-[#E6E6E8] pt-8", className)}>
      <p className="text-center text-sm text-[#808088]">{children}</p>
    </div>
  );
}

// Footer.Custom
function Custom({ children, className }: FooterCustomProps) {
  return <div className={className}>{children}</div>;
}

// Main component
function Footer({ className, children, ref, ...props }: FooterProps) {
  return (
    <footer ref={ref} className={cn("border-t border-[#E6E6E8] bg-white", className)} {...props}>
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">{children}</div>
      </div>
    </footer>
  );
}

// Attach sub-components
Footer.Brand = Brand;
Footer.Column = Column;
Footer.Link = Link;
Footer.SocialLinks = SocialLinks;
Footer.SocialLink = SocialLink;
Footer.Copyright = Copyright;
Footer.Custom = Custom;

export { Footer };
