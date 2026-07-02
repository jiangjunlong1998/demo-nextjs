'use client'

import Image from 'next/image';
import { EditProduct } from './edit';
import { PencilIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { ProductVariantForm } from './product-variant';
import { formatDate, formatMoney } from '@/app/lib/utils';
import { useState } from 'react';

export default function ProductTable({
  query,
  currentPage,
  store,
  products
}: {
  query: string;
  currentPage: number;
  store: string;
  products: Array<any>
}) {
  const [open, setOpen] = useState(false)
  const [select, setSelect] = useState({title:'',id: '',onlineStoreUrl: ''})
  return (
    <>
        <div className="mt-6 ">
        <div className="inline-block min-w-full align-middle">
            <div className="rounded-lg bg-gray-50 p-2 md:pt-0 overflow-y-auto h-full relative">
            <table className="hidden min-w-full text-gray-900 md:table">
                <thead className="rounded-lg text-left text-sm font-normal">
                <tr>
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                    产品
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                    状态
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                    价格
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                    库存
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                    供应商
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                    创建时间
                    </th>
                    <th scope="col" className="relative py-3 pl-6 pr-3">
                    <span className="sr-only">Edit</span>
                    </th>
                </tr>
                </thead>
                <tbody className="bg-white">
                {products?.map((product: any) => (
                    <tr
                    key={product.id}
                    className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                    >
                    <td className="whitespace-nowrap py-2 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                        <Image
                            src={product.featuredImage.url}
                            className="rounded-md"
                            width={40}
                            height={40}
                            alt={`${product.featuredImage.altText}'s profile picture`}
                        />
                        <p>{product.title}</p>
                        </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                        {product.status}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                        {formatMoney(
                            product.priceRangeV2.minVariantPrice.amount,
                            product.priceRangeV2.minVariantPrice.currencyCode
                        )}
                        {product.priceRangeV2.minVariantPrice.amount !==
                            product.priceRangeV2.maxVariantPrice.amount && (
                            <span className="text-muted-foreground">
                            {" "}
                            ~{" "}
                            {formatMoney(
                                product.priceRangeV2.maxVariantPrice.amount,
                                product.priceRangeV2.maxVariantPrice.currencyCode
                            )}
                            </span>
                        )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                        {product.totalInventory ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                        {product.vendor || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDate(product.createdAt)}
                        </td>
                    <td className="whitespace-nowrap py-2 pl-6 pr-3">
                        <div className="flex justify-end gap-3">
                        {/* <EditProduct id={product.id} title={product.title} store={store}/> */}
                        <Button aria-haspopup="dialog" onClick={() => {setOpen(true);setSelect(product)}} variant="outline"><PencilIcon className="w-5" /></Button>
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
        </div>
        <Drawer direction="right" open={open} onOpenChange={setOpen}>
            <DrawerContent className="h-full mt-0 left-auto right-0 !max-w-full !w-1/2">
                <DrawerHeader>
                <DrawerTitle>{select?.title}
                    <Button variant="outline" asChild className='ml-5' size='icon'>
                        <a href={select?.onlineStoreUrl} target="_blank" rel="noopener noreferrer">
                            <EyeIcon />
                        </a>
                    </Button>
                </DrawerTitle>
                {/* <DrawerDescription>Set your daily activity goal.</DrawerDescription> */}
                </DrawerHeader>
                <div className="no-scrollbar overflow-y-auto px-4">
                    <ProductVariantForm id={select.id} store={store}/>
                </div>
                <DrawerFooter>
                {/* <Button className='bg-blue-600 hover:bg-blue-700'>Submit</Button> */}
                <DrawerClose asChild>
                    <Button variant="outline">Close</Button>
                </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    </>
  );
}
