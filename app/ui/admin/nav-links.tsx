'use client';

import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  CubeIcon,
  PercentBadgeIcon
} from '@heroicons/react/24/outline';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  // { name: 'Home', href: '/admin', icon: HomeIcon },
  { name: 'Products', href: '/products', icon: CubeIcon },
  { name: 'Discounts', href: '/discounts', icon: PercentBadgeIcon }
];

export default function NavLinks({currentStore}: {currentStore: string}) {
  const pathName = usePathname()
  console.log(currentStore);
  
  return (
    <>
      {links.map((link) => {
        const fullHref = `/admin/${currentStore}/${link.href}`
        const isActive = pathName.startsWith(fullHref)
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={fullHref}
            className={clsx('flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3', {
              'bg-sky-100 text-blue-600': isActive
            })}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
