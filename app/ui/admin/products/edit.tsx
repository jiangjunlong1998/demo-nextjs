import { PencilIcon } from '@heroicons/react/24/outline';
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
import { getProductById } from '@/app/lib/shopify/productHandle';

export async function EditProduct({ id, title, store }: { id: string, title: string, store: string }) {
    const res = await getProductById(store, id)
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline"><PencilIcon className="w-5" /></Button>
      </DrawerTrigger>
      <DrawerContent className="h-full mt-0 left-auto right-0 !max-w-full !w-1/2">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          {/* <DrawerDescription>Set your daily activity goal.</DrawerDescription> */}
        </DrawerHeader>
        <div className="no-scrollbar overflow-y-auto px-4">
          <ProductVariantForm id={id} store={store}/>
        </div>
        <DrawerFooter>
          <Button className='bg-blue-600 hover:bg-blue-700'>Submit</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}