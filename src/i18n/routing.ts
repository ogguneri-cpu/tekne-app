import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['tr', 'en'],
  defaultLocale: 'tr',
  localePrefix: 'as-needed' // Prefix only for non-default or keep it clean
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
