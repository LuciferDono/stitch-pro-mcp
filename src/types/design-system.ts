export interface DesignSystem {
  id: string;
  name: string;
  version: string;
  brand: BrandDescription;
  tokens: DesignTokens;
  rules: DesignRule[];
}

export interface BrandDescription {
  name: string;
  industry?: string;
  personality: string[];
  primaryColor?: string;
  logoUrl?: string;
}

export interface DesignTokens {
  colors: ColorScale;
  typography: TypographyScale;
  spacing: SpacingScale;
  radii: Record<string, string>;
  shadows: Record<string, string>;
}

export interface ColorScale {
  primary: Record<string, string>;
  secondary: Record<string, string>;
  neutral: Record<string, string>;
  success: Record<string, string>;
  warning: Record<string, string>;
  error: Record<string, string>;
}

export interface TypographyScale {
  fontFamilies: { heading: string; body: string; mono?: string };
  sizes: Record<string, { size: string; lineHeight: string; weight: string }>;
}

export type SpacingScale = Record<string, string>;

export interface DesignRule {
  id: string;
  description: string;
  severity: 'error' | 'warning';
  selector?: string;
  validator: string;
}
