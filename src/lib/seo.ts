import { useEffect } from 'react';

interface SeoOptions {
  title: string;
  description: string;
  canonicalPath?: string;
}

export function usePageSeo({ title, description, canonicalPath }: SeoOptions): void {
  useEffect(() => {
    const fullTitle = title.includes('The Timeless Art of Strategic Thinking')
      ? title
      : `${title} — The Timeless Art of Strategic Thinking`;
    document.title = fullTitle;

    const setMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);

    const path = canonicalPath ?? window.location.pathname;
    const canonicalHref = `${window.location.origin}${path}`;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalHref);
  }, [title, description, canonicalPath]);
}
