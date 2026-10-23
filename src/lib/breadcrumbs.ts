import { siteConfig } from '@/config/site';

/** Build BreadcrumbList JSON-LD. Every crumb needs an absolute-capable path (incl. current page). */
export function breadcrumbList(items: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: new URL(item.href, siteConfig.siteUrl).toString(),
    })),
  };
}
